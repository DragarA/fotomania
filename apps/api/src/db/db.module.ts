import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createDrizzleConnection, DRIZZLE, DrizzleDB } from './drizzle';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DrizzleDB => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not defined');
        }
        return createDrizzleConnection(databaseUrl);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule {}
