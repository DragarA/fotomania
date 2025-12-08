import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, user: any) => void): void {
    done(null, user.id);
  }

  async deserializeUser(
    userId: string,
    done: (err: Error | null, user: any) => void
  ): Promise<void> {
    try {
      const user = await this.authService.findUserById(userId);
      done(null, user);
    } catch (err) {
      done(err as Error, null);
    }
  }
}
