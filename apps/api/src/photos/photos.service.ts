import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

import {
    ForbiddenException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { and, eq, isNotNull } from 'drizzle-orm';
import sharp from 'sharp';

import { DRIZZLE, type DbInstance, type DrizzleDB } from '../common/db/drizzle';
import { catalogue } from '../common/db/schema/catalogues.schema';
import { collection } from '../common/db/schema/collections.schema';
import { photo } from '../common/db/schema/photos.schema';

@Injectable()
export class PhotosService {
    private readonly logger = new Logger(PhotosService.name);
    private uploadRoot = path.resolve('./uploads');
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

    async findAll(collectionId: string, ownerId: string) {
        // Verify the collection exists and user owns it
        const [existingCollection] = await this.db
            .select({ collection, catalogue })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(eq(collection.id, collectionId));

        if (!existingCollection) {
            throw new NotFoundException(
                `Collection with ID ${collectionId} not found`
            );
        }

        if (existingCollection.catalogue.ownerId !== ownerId) {
            throw new ForbiddenException(
                'You do not have permission to view photos in this collection'
            );
        }

        return this.db
            .select()
            .from(photo)
            .where(eq(photo.collectionId, collectionId))
            .orderBy(photo.createdAt);
    }

    async findPublicBySlugAndCollection(slug: string, collectionId: string) {
        const [existingCollection] = await this.db
            .select()
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(catalogue.publicUrlSlug, slug),
                    eq(catalogue.status, 'published'),
                    eq(collection.id, collectionId)
                )
            );

        if (!existingCollection) {
            throw new NotFoundException(
                `Collection ID ${collectionId} not found under public slug ${slug}`
            );
        }

        return await this.db
            .select()
            .from(photo)
            .where(eq(photo.collectionId, existingCollection.collection.id))
            .orderBy(photo.createdAt);
    }

    async findOne(id: string, ownerId: string) {
        const [result] = await this.db
            .select({ photo, catalogue })
            .from(photo)
            .innerJoin(collection, eq(photo.collectionId, collection.id))
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(and(eq(photo.id, id), eq(catalogue.ownerId, ownerId)));

        if (!result) {
            throw new NotFoundException(`Photo with ID ${id} not found`);
        }

        return result.photo;
    }

    async remove(id: string, ownerId: string) {
        // 1. Fetch photo and verify ownership
        const result = await this.findOne(id, ownerId);

        // 2. Check if this photo is used as catalogue cover
        const [catalogueWithCover] = await this.db
            .select({ catalogue, collection })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(collection.id, result.collectionId),
                    isNotNull(catalogue.coverImage),
                    eq(catalogue.coverImage, result.storagePath)
                )
            );

        // 3. Delete physical files (with error handling)
        try {
            const collectionPath = path.dirname(
                path.join(this.uploadRoot, result.storagePath)
            );

            // Delete original file
            try {
                await fsPromises.unlink(path.join(this.uploadRoot, result.storagePath));
            } catch (error) {
                this.logger.error(
                    `Failed to delete photo file: ${result.storagePath}`,
                    error
                );
            }

            // Delete thumbnail if exists
            if (result.thumbnailPath) {
                try {
                    await fsPromises.unlink(
                        path.join(this.uploadRoot, result.thumbnailPath)
                    );
                } catch (error) {
                    this.logger.error(
                        `Failed to delete thumbnail file: ${result.thumbnailPath}`,
                        error
                    );
                }
            }

            // Clean up empty directory
            try {
                const files = await fsPromises.readdir(collectionPath);
                if (files.length === 0) {
                    await fsPromises.rmdir(collectionPath);
                }
            } catch (error) {
                this.logger.error(
                    `Failed to remove empty directory: ${collectionPath}`,
                    error
                );
            }
        } catch (error) {
            this.logger.error(
                `Error during file cleanup for photo ${id}. Continuing with database cleanup.`,
                error
            );
        }

        // 4. Delete photo from database (always executes even if file deletion fails)
        await this.db.delete(photo).where(eq(photo.id, id));

        // 5. If photo was catalogue cover, auto-select next photo
        if (catalogueWithCover) {
            await this.reassignCatalogueCover(catalogueWithCover.catalogue.id);
        }

        return { message: 'Photo deleted successfully' };
    }

    async removeAllForCollection(
        collectionId: string,
        dbInstance?: DbInstance
    ) {
        const db = dbInstance || this.db;

        await db.delete(photo).where(eq(photo.collectionId, collectionId));

        const [catalogueWithCover] = await db
            .select({ catalogue, collection })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(collection.id, collectionId),
                    isNotNull(catalogue.coverImage)
                )
            );
        if (catalogueWithCover) {
            const [coverPhoto] = await db
                .select()
                .from(photo)
                .where(
                    eq(
                        photo.storagePath,
                        catalogueWithCover.catalogue.coverImage!
                    )
                )
                .limit(1);
            if (!coverPhoto) {
                await this.reassignCatalogueCover(
                    catalogueWithCover.catalogue.id,
                    db
                );
            }
        }
    }

    private async reassignCatalogueCover(
        catalogueId: string,
        dbInstance?: DbInstance
    ) {
        const db = dbInstance || this.db;

        // Find next available photo (oldest first for consistency)
        const [nextPhoto] = await db
            .select()
            .from(photo)
            .innerJoin(collection, eq(photo.collectionId, collection.id))
            .where(eq(collection.catalogueId, catalogueId))
            .orderBy(photo.createdAt)
            .limit(1);

        // Update catalogue cover (null if no photos remain)
        await db
            .update(catalogue)
            .set({
                coverImage: nextPhoto ? nextPhoto.photo.storagePath : null,
                updatedAt: new Date(),
            })
            .where(eq(catalogue.id, catalogueId));
    }

    async uploadFile(
        file: Express.Multer.File,
        collectionId: string,
        ownerId: string
    ) {
        // 1. Verify collection exists and user owns it
        const [existingCollection] = await this.db
            .select({ collection, catalogue })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(eq(collection.id, collectionId));

        if (!existingCollection) {
            throw new NotFoundException(
                `Collection with ID ${collectionId} not found`
            );
        }

        if (existingCollection.catalogue.ownerId !== ownerId) {
            throw new ForbiddenException(
                'You do not have permission to upload photos to this collection'
            );
        }

        const collectionPath = path.join(
            this.uploadRoot,
            'collections',
            collectionId
        );

        // Ensure collection directory exists
        try {
            await fsPromises.access(collectionPath);
        } catch {
            try {
                await fsPromises.mkdir(collectionPath, { recursive: true });
            } catch (error) {
                this.logger.error(
                    `Failed to create collection directory: ${collectionPath}`,
                    error
                );
                throw new Error('Failed to create upload directory');
            }
        }

        // 2. Create photo record
        const photoId = crypto.randomUUID();
        const now = new Date();

        const filePath = path.join(
            collectionPath,
            photoId + path.extname(file.originalname)
        );
        const thumbnailPath = path.join(
            collectionPath,
            'thumb_' + photoId + path.extname(file.originalname)
        );

        const originalSharp = sharp(file.buffer).rotate();
        const originalMetadata = await originalSharp.metadata();

        await originalSharp
            .resize({
                width: 1000,
                withoutEnlargement: true,
            })
            .jpeg({ quality: 80 })
            .toFile(filePath);

        const thumbSharp = sharp(file.buffer).rotate();
        await thumbSharp
            .resize({
                width: 400,
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

        let fileSize: number;
        try {
            const stats = await fsPromises.stat(filePath);
            fileSize = stats.size;
        } catch (error) {
            this.logger.error(`Failed to read file stats for: ${filePath}`, error);
            fileSize = file.size; // Fallback to original file size
        }

        const relativeOriginalPath = path
            .relative(this.uploadRoot, filePath)
            .replace(/\\/g, '/'); // normalize for URLs

        const relativeThumbPath = path
            .relative(this.uploadRoot, thumbnailPath)
            .replace(/\\/g, '/');

        const photoData = {
            id: photoId,
            originalFileName: file.originalname,
            storagePath: relativeOriginalPath,
            mimeType: file.mimetype,
            size: fileSize,
            collectionId,
            thumbnailPath: relativeThumbPath, // Future: generate thumbnail
            width: originalMetadata.width || null,
            height: originalMetadata.height || null,
            createdAt: now,
            updatedAt: now,
        };

        const [newPhoto] = await this.db
            .insert(photo)
            .values(photoData)
            .returning();

        // Auto-set as catalogue cover if catalogue has no cover yet
        const catalogueId = existingCollection.catalogue.id;
        if (!existingCollection.catalogue.coverImage) {
            await this.db
                .update(catalogue)
                .set({
                    coverImage: relativeOriginalPath,
                    updatedAt: new Date(),
                })
                .where(eq(catalogue.id, catalogueId));
        }

        return newPhoto;
    }
}
