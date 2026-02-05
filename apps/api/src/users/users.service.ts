import { unlinkSync } from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { user } from '../common/db/schema';

import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

    async findOne(id: string) {
        const [foundUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.id, id));
        return foundUser;
    }

    async findByEmail(email: string) {
        const [foundUser] = await this.db
            .select()
            .from(user)
            .where(eq(user.email, email));
        return foundUser;
    }

    async update(id: string, data: UpdateUserDto) {
        // Filter out undefined values and prepare update data
        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.businessName !== undefined) {
            updateData.businessName = data.businessName || null;
        }
        if (data.businessAddress !== undefined) {
            updateData.businessAddress = data.businessAddress || null;
        }
        if (data.businessPhone !== undefined) {
            updateData.businessPhone = data.businessPhone || null;
        }
        if (data.businessEmail !== undefined) {
            updateData.businessEmail = data.businessEmail || null;
        }
        if (data.businessWebsite !== undefined) {
            updateData.businessWebsite = data.businessWebsite || null;
        }
        if (data.businessLogo !== undefined) {
            updateData.businessLogo = data.businessLogo || null;
        }
        if (data.businessDescription !== undefined) {
            updateData.businessDescription = data.businessDescription || null;
        }
        if (data.brandColorMain !== undefined) {
            updateData.brandColorMain = data.brandColorMain || null;
        }
        if (data.brandColorAccent !== undefined) {
            updateData.brandColorAccent = data.brandColorAccent || null;
        }
        if (data.preferredLanguage !== undefined) {
            updateData.preferredLanguage = data.preferredLanguage;
        }
        if (data.collectClientName !== undefined) {
            updateData.collectClientName = data.collectClientName;
        }
        if (data.collectClientAddress !== undefined) {
            updateData.collectClientAddress = data.collectClientAddress;
        }
        if (data.collectClientPhone !== undefined) {
            updateData.collectClientPhone = data.collectClientPhone;
        }
        if (data.collectClientNotes !== undefined) {
            updateData.collectClientNotes = data.collectClientNotes;
        }

        const [updatedUser] = await this.db
            .update(user)
            .set(updateData)
            .where(eq(user.id, id))
            .returning();
        return updatedUser;
    }

    async uploadLogo(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file provided');
        }

        // Get current user to check if old logo exists
        const currentUser = await this.findOne(userId);
        if (currentUser?.businessLogo) {
            try {
                unlinkSync(currentUser.businessLogo);
            } catch {
                // Ignore if file doesn't exist
            }
        }

        // Update user with new logo path
        const [updatedUser] = await this.db
            .update(user)
            .set({
                businessLogo: file.path,
                updatedAt: new Date(),
            })
            .where(eq(user.id, userId))
            .returning();

        return updatedUser;
    }

    async removeLogo(userId: string) {
        const currentUser = await this.findOne(userId);

        if (currentUser?.businessLogo) {
            try {
                unlinkSync(currentUser.businessLogo);
            } catch {
                // Ignore if file doesn't exist
            }
        }

        const [updatedUser] = await this.db
            .update(user)
            .set({
                businessLogo: null,
                updatedAt: new Date(),
            })
            .where(eq(user.id, userId))
            .returning();

        return updatedUser;
    }
}
