import {
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { and, eq, isNotNull } from 'drizzle-orm';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

import { catalogue } from '../common/db/schema/catalogues.schema';
import { collection } from '../common/db/schema/collections.schema';
import { photo } from '../common/db/schema/photos.schema';
import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';

@Injectable()
export class PhotosService {
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
            .leftJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(catalogue.publicUrlSlug, slug),
                    eq(collection.id, collectionId)
                )
            );

        if (!existingCollection) {
            throw new NotFoundException(
                `Collection ID ${collectionId} not found under public slug ${slug}`
            );
        }

        console.log('Existing Collection:', existingCollection.collection.id);

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

        // 3. Delete physical files
        const collectionPath = path.dirname(
            path.join(this.uploadRoot, result.storagePath)
        );
        fs.unlinkSync(path.join(this.uploadRoot, result.storagePath));

        if (result.thumbnailPath) {
            fs.unlinkSync(path.join(this.uploadRoot, result.thumbnailPath));
        }

        // If after deleting the directory is empty, remove it
        if (fs.readdirSync(collectionPath).length === 0) {
            fs.rmdirSync(collectionPath);
        }

        // 4. Delete photo from database
        await this.db.delete(photo).where(eq(photo.id, id));

        // 5. If photo was catalogue cover, auto-select next photo
        if (catalogueWithCover) {
            await this.reassignCatalogueCover(catalogueWithCover.catalogue.id);
        }

        return { message: 'Photo deleted successfully' };
    }

    async removeAllForCollection(collectionId: string) {
        await this.db.delete(photo).where(eq(photo.collectionId, collectionId));

        const [catalogueWithCover] = await this.db
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
            const [coverPhoto] = await this.db
                .select()
                .from(photo)
                .where(
                    eq(
                        photo.storagePath,
                        catalogueWithCover.catalogue.coverImage!
                    )
                )
                .limit(1);
            if(!coverPhoto) {
                await this.reassignCatalogueCover(
                    catalogueWithCover.catalogue.id
                );
            }
        }
    }

    private async reassignCatalogueCover(catalogueId: string) {
        // Find next available photo (oldest first for consistency)
        const [nextPhoto] = await this.db
            .select()
            .from(photo)
            .innerJoin(collection, eq(photo.collectionId, collection.id))
            .where(eq(collection.catalogueId, catalogueId))
            .orderBy(photo.createdAt)
            .limit(1);

        // Update catalogue cover (null if no photos remain)
        await this.db
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

        console.log('collectionPath', collectionPath);

        if (!fs.existsSync(collectionPath)) {
            fs.mkdirSync(collectionPath, { recursive: true });
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

        const stats = fs.statSync(filePath);

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
            size: stats.size,
            collectionId,
            thumbnailPath: relativeThumbPath, // Future: generate thumbnail
            width: originalMetadata.width || null,
            height: originalMetadata.height || null,
            createdAt: now,
            updatedAt: now,
        };

        console.log(photoData);

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
