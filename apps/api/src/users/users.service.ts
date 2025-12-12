import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { user } from '../common/db/schema';

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

    async findAll() {
        return this.db.select().from(user);
    }

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

    async update(id: string, data: { email?: string; name?: string }) {
        const [updatedUser] = await this.db
            .update(user)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updatedUser;
    }

    async remove(id: string) {
        await this.db.delete(user).where(eq(user.id, id));
    }
}
