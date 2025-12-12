import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Inject,
} from '@nestjs/common';
import { eq, and, count, gt } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

import { CollectionsService } from '../collections/collections.service';
import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { catalogue } from '../common/db/schema/catalogues.schema';
import { clientFavourite } from '../common/db/schema/client-favourite.schema';
import { clientSession } from '../common/db/schema/client-session.schema';
import { collection } from '../common/db/schema/collections.schema';
import { photo } from '../common/db/schema/photos.schema';

import { ClientFavouritesResDto } from './dto/client-favourites-res.dto';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';

@Injectable()
export class CataloguesService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly collectionsService: CollectionsService
    ) {}

    async create(createCatalogueDto: CreateCatalogueDto, ownerId: string) {
        const publicUrlSlug = uuid();

        const id = crypto.randomUUID();
        const now = new Date();

        const [newCatalogue] = await this.db
            .insert(catalogue)
            .values({
                id,
                ...createCatalogueDto,
                publicUrlSlug,
                ownerId,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        return newCatalogue;
    }

    async findAll(ownerId: string) {
        return this.db
            .select({
                catalogue,
                photoCount: count(photo.id),
            })
            .from(catalogue)
            .leftJoin(collection, eq(catalogue.id, collection.catalogueId))
            .leftJoin(photo, eq(collection.id, photo.collectionId))
            .groupBy(catalogue.id)
            .where(eq(catalogue.ownerId, ownerId));
    }

    async findOne(id: string, ownerId: string) {
        const [result] = await this.db
            .select()
            .from(catalogue)
            .where(and(eq(catalogue.id, id), eq(catalogue.ownerId, ownerId)));

        if (!result) {
            throw new NotFoundException(`Catalogue with ID ${id} not found`);
        }

        return result;
    }

    async findPublicBySlug(slug: string) {
        const [catalogueResult] = await this.db
            .select()
            .from(catalogue)
            .leftJoin(collection, eq(catalogue.id, collection.catalogueId))
            .where(eq(catalogue.publicUrlSlug, slug));

        if (!catalogueResult) {
            throw new NotFoundException(
                `Catalogue with slug ${slug} not found`
            );
        }

        const collectionResult = await this.db
            .select({
                collection,
            })
            .from(collection)
            .innerJoin(photo, eq(collection.id, photo.collectionId))
            .where(
                and(eq(collection.catalogueId, catalogueResult.catalogue.id))
            )
            .having(gt(count(photo.id), 0))
            .groupBy(collection.id);
        return {
            catalogue: catalogueResult.catalogue,
            collections: collectionResult.map((cr) => cr.collection),
        };
    }

    async update(
        id: string,
        updateCatalogueDto: UpdateCatalogueDto,
        ownerId: string
    ) {
        // First check if catalogue exists and user owns it
        const existing = await this.findOne(id, ownerId);

        if (!existing) {
            throw new NotFoundException(`Catalogue with ID ${id} not found`);
        }

        if (existing.ownerId !== ownerId) {
            throw new ForbiddenException(
                'You do not have permission to update this catalogue'
            );
        }

        const [updated] = await this.db
            .update(catalogue)
            .set({
                ...updateCatalogueDto,
                updatedAt: new Date(),
            })
            .where(eq(catalogue.id, id))
            .returning();

        return updated;
    }

    async remove(id: string, ownerId: string) {
        // First check if catalogue exists and user owns it
        const existing = await this.findOne(id, ownerId);

        if (!existing) {
            throw new NotFoundException(`Catalogue with ID ${id} not found`);
        }

        if (existing.ownerId !== ownerId) {
            throw new ForbiddenException(
                'You do not have permission to delete this catalogue'
            );
        }

        // Use transaction to ensure atomicity of cascade delete
        await this.db.transaction(async (tx) => {
            await this.collectionsService.removeAllForCatalogue(id, tx);
            await tx.delete(catalogue).where(eq(catalogue.id, id));
        });

        return { message: 'Catalogue deleted successfully' };
    }

    async setCover(catalogueId: string, photoId: string, ownerId: string) {
        // 1. Verify catalogue exists and user owns it
        const existingCatalogue = await this.findOne(catalogueId, ownerId);

        if (!existingCatalogue) {
            throw new NotFoundException(
                `Catalogue with ID ${catalogueId} not found`
            );
        }

        // 2. Verify photo exists and belongs to this catalogue
        const [photoResult] = await this.db
            .select({ photo, collection })
            .from(photo)
            .innerJoin(collection, eq(photo.collectionId, collection.id))
            .where(
                and(
                    eq(photo.id, photoId),
                    eq(collection.catalogueId, catalogueId)
                )
            );

        if (!photoResult) {
            throw new NotFoundException(
                `Photo with ID ${photoId} not found in catalogue ${catalogueId}`
            );
        }

        // 3. Update catalogue with photo's thumbnailPath
        const [updated] = await this.db
            .update(catalogue)
            .set({
                coverImage: photoResult.photo.storagePath,
                updatedAt: new Date(),
            })
            .where(eq(catalogue.id, catalogueId))
            .returning();

        return updated;
    }

    async getCatalogueFavourites(catalogueId: string, ownerId: string) {
        // 1. Verify catalogue exists and user owns it
        const existingCatalogue = await this.findOne(catalogueId, ownerId);

        if (!existingCatalogue) {
            throw new NotFoundException(
                `Catalogue with ID ${catalogueId} not found`
            );
        }

        // 2. Query client sessions with their favourites
        const sessions = await this.db
            .select({
                sessionId: clientSession.id,
                email: clientSession.email,
                createdAt: clientSession.createdAt,
                photoCount: count(clientFavourite.photoId),
            })
            .from(clientSession)
            .innerJoin(
                clientFavourite,
                eq(clientSession.id, clientFavourite.clientSessionId)
            )
            .innerJoin(photo, eq(clientFavourite.photoId, photo.id))
            .where(eq(clientSession.catalogueId, catalogueId))
            .groupBy(clientSession.id)
            .orderBy(clientSession.createdAt);

        return Object.values(sessions).map(
            (session) => new ClientFavouritesResDto(session)
        );
    }
}
