import * as fs from 'fs';
import * as path from 'path';

import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';

import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { catalogue } from '../common/db/schema/catalogues.schema';
import { collection } from '../common/db/schema/collections.schema';
import { photo } from '../common/db/schema/photos.schema';
import { PhotosService } from '../photos/photos.service';

import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
    private uploadRoot = path.resolve('./uploads');

    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly photosService: PhotosService
    ) {}

    async create(createCollectionDto: CreateCollectionDto, ownerId: string) {
        // Verify the catalogue exists and user owns it
        const [existingCatalogue] = await this.db
            .select()
            .from(catalogue)
            .where(eq(catalogue.id, createCollectionDto.catalogueId));

        if (!existingCatalogue) {
            throw new NotFoundException(
                `Catalogue with ID ${createCollectionDto.catalogueId} not found`
            );
        }

        if (existingCatalogue.ownerId !== ownerId) {
            throw new ForbiddenException(
                'You do not have permission to add collections to this catalogue'
            );
        }

        const id = crypto.randomUUID();
        const now = new Date();

        const [newCollection] = await this.db
            .insert(collection)
            .values({
                id,
                name: createCollectionDto.name,
                catalogueId: createCollectionDto.catalogueId,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        return newCollection;
    }

    async findAll(catalogueId: string, ownerId: string) {
        // Verify the catalogue exists and user owns it
        const [existingCatalogue] = await this.db
            .select()
            .from(catalogue)
            .where(eq(catalogue.id, catalogueId));

        if (!existingCatalogue) {
            throw new NotFoundException(
                `Catalogue with ID ${catalogueId} not found`
            );
        }

        if (existingCatalogue.ownerId !== ownerId) {
            throw new ForbiddenException(
                'You do not have permission to view collections in this catalogue'
            );
        }

        return this.db
            .select({
                collection,
                photoCount: sql<number>`cast(count(${photo.id}) as int)`,
            })
            .from(collection)
            .leftJoin(photo, eq(collection.id, photo.collectionId))
            .where(eq(collection.catalogueId, catalogueId))
            .groupBy(collection.id);
    }

    async findOne(id: string, ownerId: string) {
        const [result] = await this.db
            .select({
                collection,
                photoCount: sql<number>`cast(count(${photo.id}) as int)`,
            })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .leftJoin(photo, eq(collection.id, photo.collectionId))
            .where(and(eq(collection.id, id), eq(catalogue.ownerId, ownerId)))
            .groupBy(collection.id);

        if (!result) {
            throw new NotFoundException(`Collection with ID ${id} not found`);
        }

        return result;
    }

    async update(
        id: string,
        updateCollectionDto: UpdateCollectionDto,
        ownerId: string
    ) {
        // First check if collection exists and user owns the parent catalogue
        const existing = await this.findOne(id, ownerId);

        if (!existing) {
            throw new NotFoundException(`Collection with ID ${id} not found`);
        }

        const [updated] = await this.db
            .update(collection)
            .set({
                ...updateCollectionDto,
                updatedAt: new Date(),
            })
            .where(eq(collection.id, id))
            .returning();

        return updated;
    }

    async removeAllForCatalogue(catalogueId: string) {
        const collections = await this.db
            .select()
            .from(collection)
            .where(eq(collection.catalogueId, catalogueId));

        for (const coll of collections) {
            await this.remove(coll.id, coll.catalogueId);
        }
    }

    async remove(id: string, ownerId: string) {
        // First check if collection exists and user owns the parent catalogue
        const existing = await this.findOne(id, ownerId);

        if (!existing) {
            throw new NotFoundException(`Collection with ID ${id} not found`);
        }

        const collectionPath = path.join(this.uploadRoot, 'collections', id);
        if (fs.existsSync(collectionPath)) {
            fs.rmdirSync(collectionPath, {
                recursive: true,
            });
        }

        await this.photosService.removeAllForCollection(id);

        await this.db.delete(collection).where(eq(collection.id, id));

        return { message: 'Collection deleted successfully' };
    }
}
