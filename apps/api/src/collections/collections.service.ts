import { promises as fsPromises } from 'fs';
import * as path from 'path';

import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, sql } from 'drizzle-orm';

import { DRIZZLE, type DbInstance, type DrizzleDB } from '../common/db/drizzle';
import { catalogue } from '../common/db/schema/catalogues.schema';
import { clientSession } from '../common/db/schema/client-session.schema';
import { collection } from '../common/db/schema/collections.schema';
import { deliveryDownload } from '../common/db/schema/delivery-download.schema';
import { photo } from '../common/db/schema/photos.schema';
import { user } from '../common/db/schema/users.schema';
import { EmailTemplate } from '../common/email/email.constants';
import { EmailService } from '../common/email/email.service';
import { PhotosService } from '../photos/photos.service';

import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
    private readonly logger = new Logger(CollectionsService.name);
    private uploadRoot = path.resolve('./uploads');

    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly photosService: PhotosService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService
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
                clientEmail: clientSession.email,
            })
            .from(collection)
            .leftJoin(photo, eq(collection.id, photo.collectionId))
            .leftJoin(
                clientSession,
                eq(collection.clientSessionId, clientSession.id)
            )
            .where(eq(collection.catalogueId, catalogueId))
            .groupBy(collection.id, clientSession.email);
    }

    async findOne(id: string, ownerId: string) {
        const [result] = await this.db
            .select({
                collection,
                photoCount: sql<number>`cast(count(${photo.id}) as int)`,
                clientEmail: clientSession.email,
            })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .leftJoin(photo, eq(collection.id, photo.collectionId))
            .leftJoin(
                clientSession,
                eq(collection.clientSessionId, clientSession.id)
            )
            .where(and(eq(collection.id, id), eq(catalogue.ownerId, ownerId)))
            .groupBy(collection.id, clientSession.email);

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

    async removeAllForCatalogue(
        catalogueId: string,
        tx?: DbInstance
    ) {
        const dbInstance = tx || this.db;

        const collections = await dbInstance
            .select()
            .from(collection)
            .where(eq(collection.catalogueId, catalogueId));

        for (const coll of collections) {
            await this.removeCollection(coll.id, dbInstance);
        }
    }

    async remove(id: string, ownerId: string) {
        // First check if collection exists and user owns the parent catalogue
        const existing = await this.findOne(id, ownerId);

        if (!existing) {
            throw new NotFoundException(`Collection with ID ${id} not found`);
        }

        // Use transaction to ensure atomicity of cascade delete
        await this.db.transaction(async (tx) => {
            await this.removeCollection(id, tx);
        });

        return { message: 'Collection deleted successfully' };
    }

    private async removeCollection(id: string, dbInstance: DbInstance) {
        // Delete collection directory with error handling
        const collectionPath = path.join(this.uploadRoot, 'collections', id);
        try {
            await fsPromises.access(collectionPath);
            try {
                await fsPromises.rm(collectionPath, { recursive: true });
            } catch (error) {
                this.logger.error(
                    `Failed to remove collection directory: ${collectionPath}`,
                    error
                );
            }
        } catch {
            // Directory doesn't exist, no need to log
        }

        // Delete delivery downloads for this collection
        await dbInstance
            .delete(deliveryDownload)
            .where(eq(deliveryDownload.collectionId, id));

        await this.photosService.removeAllForCollection(id, dbInstance);

        await dbInstance.delete(collection).where(eq(collection.id, id));
    }

    /**
     * Create a delivery collection from a client session (favourites)
     */
    async createDeliveryCollection(sessionId: string, ownerId: string) {
        // 1. Verify the session exists and get the catalogue
        const [session] = await this.db
            .select({
                session: clientSession,
                catalogue,
            })
            .from(clientSession)
            .innerJoin(catalogue, eq(clientSession.catalogueId, catalogue.id))
            .where(eq(clientSession.id, sessionId));

        if (!session) {
            throw new NotFoundException(
                `Client session with ID ${sessionId} not found`
            );
        }

        // 2. Verify the user owns the catalogue
        if (session.catalogue.ownerId !== ownerId) {
            throw new ForbiddenException(
                'You do not have permission to create delivery collections for this catalogue'
            );
        }

        // 3. Check if a delivery collection already exists for this session
        const [existingDelivery] = await this.db
            .select()
            .from(collection)
            .where(eq(collection.clientSessionId, sessionId));

        if (existingDelivery) {
            throw new BadRequestException(
                'A delivery collection already exists for this session'
            );
        }

        // 4. Create the delivery collection
        const id = crypto.randomUUID();
        const now = new Date();
        const deliverySlug = crypto.randomUUID();

        const [newCollection] = await this.db
            .insert(collection)
            .values({
                id,
                name: `Delivery - ${session.session.email}`,
                catalogueId: session.catalogue.id,
                type: 'delivery',
                clientSessionId: sessionId,
                deliverySlug,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        return {
            collection: newCollection,
            photoCount: 0,
            clientEmail: session.session.email,
        };
    }

    /**
     * Get download history for a delivery collection
     */
    async getDownloadHistory(collectionId: string, ownerId: string) {
        // Verify collection exists and user owns it
        const existing = await this.findOne(collectionId, ownerId);

        if (existing.collection.type !== 'delivery') {
            throw new BadRequestException(
                'Download history is only available for delivery collections'
            );
        }

        return this.db
            .select()
            .from(deliveryDownload)
            .where(eq(deliveryDownload.collectionId, collectionId))
            .orderBy(deliveryDownload.downloadedAt);
    }

    /**
     * Send delivery ready email to the client
     */
    async sendDeliveryEmail(collectionId: string, ownerId: string) {
        // 1. Get collection with client session and catalogue info
        const [result] = await this.db
            .select({
                collection,
                clientEmail: clientSession.email,
                catalogueTitle: catalogue.title,
                photographerName: user.name,
            })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .innerJoin(user, eq(catalogue.ownerId, user.id))
            .leftJoin(
                clientSession,
                eq(collection.clientSessionId, clientSession.id)
            )
            .where(
                and(eq(collection.id, collectionId), eq(catalogue.ownerId, ownerId))
            );

        if (!result) {
            throw new NotFoundException(
                `Collection with ID ${collectionId} not found`
            );
        }

        // 2. Verify it's a delivery collection
        if (result.collection.type !== 'delivery') {
            throw new BadRequestException(
                'Email can only be sent for delivery collections'
            );
        }

        // 3. Verify we have a client email
        if (!result.clientEmail) {
            throw new BadRequestException(
                'No client email associated with this delivery collection'
            );
        }

        // 4. Verify we have a delivery slug
        if (!result.collection.deliverySlug) {
            throw new BadRequestException(
                'Delivery collection does not have a delivery URL'
            );
        }

        // 5. Build the delivery URL
        const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
        const deliveryUrl = `${frontendUrl}/d/${result.collection.deliverySlug}`;

        // 6. Send the email
        await this.emailService.send({
            to: result.clientEmail,
            subject: 'Your photos are ready',
            template: EmailTemplate.DELIVERY_READY,
            context: {
                deliveryUrl,
                photographerName: result.photographerName || undefined,
            },
        });

        this.logger.log(
            `Delivery email sent to ${result.clientEmail} for collection ${collectionId}`
        );

        return { message: 'Delivery email sent successfully' };
    }
}
