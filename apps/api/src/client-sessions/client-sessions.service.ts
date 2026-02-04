import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, inArray, count } from 'drizzle-orm';
import { I18nService } from 'nestjs-i18n';

import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { collection, photo, user } from '../common/db/schema';
import { catalogue } from '../common/db/schema/catalogues.schema';
import { clientFavourite } from '../common/db/schema/client-favourite.schema';
import { clientSession } from '../common/db/schema/client-session.schema';
import { EmailTemplate } from '../common/email/email.constants';
import { EmailService } from '../common/email/email.service';

@Injectable()
export class ClientSessionsService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly i18n: I18nService
    ) {}

    async addFavourites(
        slug: string,
        email: string,
        photoIds: string[],
        clientInfo?: {
            clientName?: string;
            clientAddressStreet?: string;
            clientAddressCity?: string;
            clientAddressPostalCode?: string;
            clientAddressCountry?: string;
            clientPhoneNumber?: string;
            clientNotes?: string;
        }
    ) {
        const [existingCatalogue] = await this.db
            .select({
                id: catalogue.id,
                title: catalogue.title,
                ownerEmail: user.email,
                ownerPreferredLanguage: user.preferredLanguage,
            })
            .from(catalogue)
            .innerJoin(user, eq(catalogue.ownerId, user.id))
            .where(eq(catalogue.publicUrlSlug, slug));

        if (!existingCatalogue) {
            throw new NotFoundException(
                `Catalogue with slug ${slug} not found`
            );
        }

        // Check if all the photo Ids belong to the catalogue with the given slug
        const [result] = await this.db
            .select({
                photoCount: count(photo.id),
            })
            .from(photo)
            .leftJoin(collection, eq(photo.collectionId, collection.id))
            .where(
                and(
                    eq(collection.catalogueId, existingCatalogue.id),
                    inArray(photo.id, photoIds)
                )
            )
            .groupBy(collection.catalogueId);

        console.log('DB:', result, 'Provided:', photoIds);

        if (result?.photoCount !== photoIds.length) {
            throw new BadRequestException(
                `Provided photo IDs do not belong to the catalogue with slug ${slug}`
            );
        }

        const photoIdsSet = new Set(photoIds);

        let [existingSession] = await this.db
            .select()
            .from(clientSession)
            .where(
                and(
                    eq(clientSession.email, email),
                    eq(clientSession.catalogueId, existingCatalogue.id)
                )
            )
            .limit(1);

        const now = new Date();

        if (!existingSession) {
            existingSession = await this.db
                .insert(clientSession)
                .values({
                    id: crypto.randomUUID(),
                    email,
                    catalogueId: existingCatalogue.id,
                    clientName: clientInfo?.clientName ?? null,
                    clientAddressStreet: clientInfo?.clientAddressStreet ?? null,
                    clientAddressCity: clientInfo?.clientAddressCity ?? null,
                    clientAddressPostalCode: clientInfo?.clientAddressPostalCode ?? null,
                    clientAddressCountry: clientInfo?.clientAddressCountry ?? null,
                    clientPhoneNumber: clientInfo?.clientPhoneNumber ?? null,
                    clientNotes: clientInfo?.clientNotes ?? null,
                    createdAt: now,
                    updatedAt: now,
                })
                .returning()
                .then((res) => res[0]);
        } else {
            // Update existing session with new client info
            [existingSession] = await this.db
                .update(clientSession)
                .set({
                    clientName: clientInfo?.clientName ?? existingSession.clientName,
                    clientAddressStreet: clientInfo?.clientAddressStreet ?? existingSession.clientAddressStreet,
                    clientAddressCity: clientInfo?.clientAddressCity ?? existingSession.clientAddressCity,
                    clientAddressPostalCode: clientInfo?.clientAddressPostalCode ?? existingSession.clientAddressPostalCode,
                    clientAddressCountry: clientInfo?.clientAddressCountry ?? existingSession.clientAddressCountry,
                    clientPhoneNumber: clientInfo?.clientPhoneNumber ?? existingSession.clientPhoneNumber,
                    clientNotes: clientInfo?.clientNotes ?? existingSession.clientNotes,
                    updatedAt: now,
                })
                .where(eq(clientSession.id, existingSession.id))
                .returning();
        }

        // Insert new favourites
        const favouritesToInsert = Array.from(photoIdsSet).map((photoId) => ({
            id: crypto.randomUUID(),
            clientSessionId: existingSession!.id,
            photoId,
        }));
        await this.db
            .delete(clientFavourite)
            .where(eq(clientFavourite.clientSessionId, existingSession!.id));
        await this.db.insert(clientFavourite).values(favouritesToInsert);

        // Send email notification to photographer
        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        const photoCount = photoIds.length;
        const ownerLanguage = existingCatalogue.ownerPreferredLanguage || 'en';

        // Get translated photo label based on count
        const photoLabelKey =
            photoCount === 1
                ? 'emails.favourites_submitted.photo_singular'
                : 'emails.favourites_submitted.photo_plural';
        const photoLabel = this.i18n.t(photoLabelKey, { lang: ownerLanguage });

        await this.emailService.send({
            to: existingCatalogue.ownerEmail,
            template: EmailTemplate.FAVOURITES_SUBMITTED,
            language: ownerLanguage,
            context: {
                clientEmail: email,
                catalogueTitle: existingCatalogue.title,
                photoCount,
                photoLabel,
                dashboardUrl: `${frontendUrl}/catalogues/${existingCatalogue.id}`,
            },
        });

        return existingSession;
    }

    async getFavouritesBySession(
        sessionId: string,
        catalogueId: string,
        ownerId: string
    ) {
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
            throw new BadRequestException(`Forbidden`);
        }

        const [session] = await this.db
            .select({
                id: clientSession.id,
                email: clientSession.email,
                clientName: clientSession.clientName,
                clientAddressStreet: clientSession.clientAddressStreet,
                clientAddressCity: clientSession.clientAddressCity,
                clientAddressPostalCode: clientSession.clientAddressPostalCode,
                clientAddressCountry: clientSession.clientAddressCountry,
                clientPhoneNumber: clientSession.clientPhoneNumber,
                clientNotes: clientSession.clientNotes,
                catalogueId: clientSession.catalogueId,
                createdAt: clientSession.createdAt,
                updatedAt: clientSession.updatedAt,
            })
            .from(clientSession)
            .where(eq(clientSession.id, sessionId))
            .limit(1);

        if (!session) {
            throw new NotFoundException(
                `Client session with ID ${sessionId} not found`
            );
        }

        const photos = await this.db
            .select({
                id: photo.id,
                originalFileName: photo.originalFileName,
                storagePath: photo.storagePath,
                thumbnailPath: photo.thumbnailPath,
                mimeType: photo.mimeType,
                width: photo.width,
                height: photo.height,
                size: photo.size,
                collectionId: photo.collectionId,
            })
            .from(photo)
            .innerJoin(clientFavourite, eq(photo.id, clientFavourite.photoId))
            .where(eq(clientFavourite.clientSessionId, sessionId));

        return {
            ...session,
            sessionId: session.id,
            photos,
        };
    }
}
