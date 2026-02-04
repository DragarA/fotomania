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
}
