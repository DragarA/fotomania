import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { DRIZZLE, DrizzleDB } from '../db/drizzle';
import { account, user } from '../db/schema';

@Injectable()
export class AuthService {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const [foundUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email));

        if (!foundUser) {
            return null;
        }

        // Find the password account for this user
        const [passwordAccount] = await this.db
            .select()
            .from(account)
            .where(eq(account.userId, foundUser.id));

        if (!passwordAccount || !passwordAccount.password) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            passwordAccount.password
        );

        if (!isPasswordValid) {
            return null;
        }

        const { ...result } = foundUser;
        return result;
    }

    async registerUser(email: string, password: string, name: string) {
        // Check if user already exists
        const [existingUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email));

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await this.db
            .insert(user)
            .values({
                id: crypto.randomUUID(),
                email,
                name,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // Create password account
        await this.db.insert(account).values({
            id: crypto.randomUUID(),
            accountId: email,
            providerId: 'credential',
            userId: newUser!.id,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return newUser;
    }

    generateAccessToken(userId: string, email: string): string {
        const payload = { sub: userId, email };
        const secret = this.configService.get<string>('JWT_SECRET');

        return this.jwtService.sign(payload, {
            secret,
            expiresIn: '7d', // 7 days
        });
    }

    generateRefreshToken(userId: string, email: string): string {
        const payload = { sub: userId, email };
        const secret = this.configService.get<string>('JWT_REFRESH_SECRET');

        return this.jwtService.sign(payload, {
            secret,
            expiresIn: '30d', // 30 days
        });
    }

    async login(user: any) {
        const accessToken = this.generateAccessToken(user.id, user.email);
        const refreshToken = this.generateRefreshToken(user.id, user.email);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
            },
        };
    }

    async refreshAccessToken(refreshToken: string) {
        const secret = this.configService.get<string>('JWT_REFRESH_SECRET');

        if (!secret) {
            throw new Error(
                'JWT_REFRESH_SECRET is not configured. Please set JWT_REFRESH_SECRET in your environment variables.'
            );
        }

        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret,
            });

            // Fetch the user to ensure they still exist
            const [foundUser] = await this.db
                .select()
                .from(user)
                .where(eq(user.id, payload.sub));

            if (!foundUser) {
                throw new Error('User not found');
            }

            // Generate new tokens
            const newAccessToken = this.generateAccessToken(
                foundUser.id,
                foundUser.email
            );
            const newRefreshToken = this.generateRefreshToken(
                foundUser.id,
                foundUser.email
            );

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: {
                    id: foundUser.id,
                    email: foundUser.email,
                    name: foundUser.name,
                    emailVerified: foundUser.emailVerified,
                },
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    async findUserById(id: string) {
        const [foundUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.id, id));
        return foundUser;
    }
}
