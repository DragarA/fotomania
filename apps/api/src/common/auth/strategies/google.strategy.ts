import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { and, eq } from 'drizzle-orm';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { DRIZZLE, DrizzleDB } from '../../db/drizzle';
import { account, user } from '../../db/schema';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly configService: ConfigService
    ) {
        const apiBaseUrl =
            configService.get<string>('API_BASE_URL') ||
            'http://localhost:3000';
        const callbackUrl =
            configService.get<string>('GOOGLE_CALLBACK_URL') ||
            `${apiBaseUrl}/auth/google/callback`;

        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
            clientSecret:
                configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
            callbackURL: callbackUrl,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
    ): Promise<any> {
        const { id, emails, displayName, photos } = profile;
        const email = emails[0]?.value;

        if (!email) {
            return done(new Error('No email found'), undefined);
        }

        // Check if user exists
        let [foundUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email));

        if (!foundUser) {
            // Create new user
            [foundUser] = await this.db
                .insert(user)
                .values({
                    id: crypto.randomUUID(),
                    email,
                    name: displayName,
                    emailVerified: true,
                    image: photos?.[0]?.value,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();
        }

        // Check if Google account is linked
        const [existingAccount] = await this.db
            .select()
            .from(account)
            .where(
                and(
                    eq(account.userId, foundUser!.id),
                    eq(account.providerId, 'google')
                )
            );

        if (!existingAccount) {
            // Link Google account
            await this.db.insert(account).values({
                id: crypto.randomUUID(),
                accountId: id,
                providerId: 'google',
                userId: foundUser!.id,
                accessToken,
                refreshToken,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        done(null, foundUser);
    }
}
