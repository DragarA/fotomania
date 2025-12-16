import { Injectable, Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';

import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { catalogue } from '../common/db/schema/catalogues.schema';

export interface PublicAccessTokenPayload {
    slug: string;
    type: 'public-access';
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
    private generateAccessToken(slug: string): string {
        const payload: PublicAccessTokenPayload = {
            slug,
            type: 'public-access',
        };

        return this.jwtService.sign(payload, {
            expiresIn: '24h',
        });
    }
}

