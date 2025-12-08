import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { DRIZZLE, DrizzleDB } from '../db/drizzle';
import { account, session, user } from '../db/schema';

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      userId: newUser.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newUser;
  }

  async createSession(userId: string, req: any) {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const [newSession] = await this.db
      .insert(session)
      .values({
        id: crypto.randomUUID(),
        userId,
        token,
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newSession;
  }

  async deleteSession(sessionId: string) {
    await this.db.delete(session).where(eq(session.id, sessionId));
  }

  async findUserById(id: string) {
    const [foundUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, id));
    return foundUser;
  }
}
