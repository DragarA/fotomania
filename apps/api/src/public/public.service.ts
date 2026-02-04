import {
    Injectable,
    Inject,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq, and, count } from 'drizzle-orm';

import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { catalogue } from '../common/db/schema/catalogues.schema';
import { clientSession } from '../common/db/schema/client-session.schema';
import { collection } from '../common/db/schema/collections.schema';
import { deliveryDownload } from '../common/db/schema/delivery-download.schema';
import { photo } from '../common/db/schema/photos.schema';

export interface PublicAccessTokenPayload {
    slug: string;
    type: 'public-access' | 'delivery-access';
}

@Injectable()
export class PublicService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Verify the password for a catalogue and return an access token if valid
     */
    async verifyPassword(slug: string, password: string): Promise<string> {
        const [catalogueResult] = await this.db
            .select({
                id: catalogue.id,
                password: catalogue.password,
            })
            .from(catalogue)
            .where(
                and(
                    eq(catalogue.publicUrlSlug, slug),
                    eq(catalogue.status, 'published')
                )
            );

        if (!catalogueResult) {
            throw new NotFoundException(`Catalogue with slug ${slug} not found`);
        }

        if (!catalogueResult.password) {
            // Catalogue is not password protected, just return a token
            return this.generateAccessToken(slug);
        }

        const isValid = await bcrypt.compare(password, catalogueResult.password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid password');
        }

        return this.generateAccessToken(slug);
    }

    /**
     * Check if a catalogue is password protected
     */
    async isPasswordProtected(slug: string): Promise<boolean> {
        const [catalogueResult] = await this.db
            .select({
                password: catalogue.password,
            })
            .from(catalogue)
            .where(
                and(
                    eq(catalogue.publicUrlSlug, slug),
                    eq(catalogue.status, 'published')
                )
            );

        if (!catalogueResult) {
            throw new NotFoundException(`Catalogue with slug ${slug} not found`);
        }

        return !!catalogueResult.password;
    }

    /**
     * Validate an access token for a specific slug
     */
    validateAccessToken(token: string, slug: string): boolean {
        try {
            const payload = this.jwtService.verify<PublicAccessTokenPayload>(token);
            return payload.type === 'public-access' && payload.slug === slug;
        } catch {
            return false;
        }
    }

    /**
     * Generate a short-lived access token for accessing a protected catalogue
     */
    private generateAccessToken(
        slug: string,
        type: 'public-access' | 'delivery-access' = 'public-access'
    ): string {
        const payload: PublicAccessTokenPayload = {
            slug,
            type,
        };

        return this.jwtService.sign(payload, {
            expiresIn: '24h',
        });
    }

    /**
     * Check if a delivery collection's parent catalogue is password protected
     */
    async isDeliveryPasswordProtected(deliverySlug: string): Promise<boolean> {
        const [result] = await this.db
            .select({
                password: catalogue.password,
            })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(collection.deliverySlug, deliverySlug),
                    eq(collection.type, 'delivery'),
                    eq(catalogue.status, 'published')
                )
            );

        if (!result) {
            throw new NotFoundException(
                `Delivery with slug ${deliverySlug} not found`
            );
        }

        return !!result.password;
    }

    /**
     * Verify the password for a delivery collection (uses parent catalogue password)
     */
    async verifyDeliveryPassword(
        deliverySlug: string,
        password: string
    ): Promise<string> {
        const [result] = await this.db
            .select({
                collectionId: collection.id,
                password: catalogue.password,
            })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(collection.deliverySlug, deliverySlug),
                    eq(collection.type, 'delivery'),
                    eq(catalogue.status, 'published')
                )
            );

        if (!result) {
            throw new NotFoundException(
                `Delivery with slug ${deliverySlug} not found`
            );
        }

        if (!result.password) {
            // Catalogue is not password protected, just return a token
            return this.generateAccessToken(deliverySlug, 'delivery-access');
        }

        const isValid = await bcrypt.compare(password, result.password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid password');
        }

        return this.generateAccessToken(deliverySlug, 'delivery-access');
    }

    /**
     * Validate an access token for a specific delivery slug
     */
    validateDeliveryAccessToken(token: string, deliverySlug: string): boolean {
        try {
            const payload =
                this.jwtService.verify<PublicAccessTokenPayload>(token);
            return (
                payload.type === 'delivery-access' &&
                payload.slug === deliverySlug
            );
        } catch {
            return false;
        }
    }

    /**
     * Get delivery collection data by slug
     */
    async findDeliveryBySlug(deliverySlug: string) {
        const [result] = await this.db
            .select({
                collection,
                clientEmail: clientSession.email,
                catalogueTitle: catalogue.title,
                photoCount: count(photo.id),
            })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .innerJoin(photo, eq(collection.id, photo.collectionId))
            .leftJoin(
                clientSession,
                eq(collection.clientSessionId, clientSession.id)
            )
            .where(
                and(
                    eq(collection.deliverySlug, deliverySlug),
                    eq(collection.type, 'delivery'),
                    eq(catalogue.status, 'published')
                )
            )
            .groupBy(collection.id, clientSession.email, catalogue.title);

        if (!result) {
            throw new NotFoundException(
                `Delivery with slug ${deliverySlug} not found`
            );
        }

        return {
            ...result,
            hasInvoice: !!result.collection.invoicePath,
        };
    }

    /**
     * Get the invoice path for a delivery collection
     */
    async getDeliveryInvoicePath(deliverySlug: string): Promise<string | null> {
        const [result] = await this.db
            .select({
                invoicePath: collection.invoicePath,
            })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(collection.deliverySlug, deliverySlug),
                    eq(collection.type, 'delivery'),
                    eq(catalogue.status, 'published')
                )
            );

        if (!result) {
            throw new NotFoundException(
                `Delivery with slug ${deliverySlug} not found`
            );
        }

        return result.invoicePath;
    }

    /**
     * Get photos for a delivery collection
     */
    async findDeliveryPhotos(deliverySlug: string) {
        const [deliveryCollection] = await this.db
            .select({ collection })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(collection.deliverySlug, deliverySlug),
                    eq(collection.type, 'delivery'),
                    eq(catalogue.status, 'published')
                )
            );

        if (!deliveryCollection) {
            throw new NotFoundException(
                `Delivery with slug ${deliverySlug} not found`
            );
        }

        return this.db
            .select()
            .from(photo)
            .where(eq(photo.collectionId, deliveryCollection.collection.id))
            .orderBy(photo.createdAt);
    }

    /**
     * Get a specific photo from a delivery collection
     */
    async findDeliveryPhoto(deliverySlug: string, photoId: string) {
        const [deliveryCollection] = await this.db
            .select({ collection })
            .from(collection)
            .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
            .where(
                and(
                    eq(collection.deliverySlug, deliverySlug),
                    eq(collection.type, 'delivery'),
                    eq(catalogue.status, 'published')
                )
            );

        if (!deliveryCollection) {
            throw new NotFoundException(
                `Delivery with slug ${deliverySlug} not found`
            );
        }

        const [foundPhoto] = await this.db
            .select()
            .from(photo)
            .where(
                and(
                    eq(photo.id, photoId),
                    eq(photo.collectionId, deliveryCollection.collection.id)
                )
            );

        if (!foundPhoto) {
            throw new NotFoundException(`Photo not found in this delivery`);
        }

        return foundPhoto;
    }

    /**
     * Record a download event for a delivery collection
     */
    async recordDownload(deliverySlug: string, ipAddress?: string) {
        const [deliveryCollection] = await this.db
            .select({ collection })
            .from(collection)
            .where(
                and(
                    eq(collection.deliverySlug, deliverySlug),
                    eq(collection.type, 'delivery')
                )
            );

        if (!deliveryCollection) {
            throw new NotFoundException(
                `Delivery with slug ${deliverySlug} not found`
            );
        }

        await this.db.insert(deliveryDownload).values({
            id: crypto.randomUUID(),
            collectionId: deliveryCollection.collection.id,
            downloadedAt: new Date(),
            ipAddress: ipAddress ?? null,
        });
    }
}

