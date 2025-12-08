import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createDrizzleMock } from './drizzle-mock.factory';
import { DRIZZLE } from '../../src/common/db/drizzle';

/**
 * Test module that provides a mocked Drizzle instance
 */
@Module({})
export class TestModule {
  static forRoot(drizzleMock?: any): DynamicModule {
    const mockDb = drizzleMock || createDrizzleMock();

    return {
      module: TestModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
              SESSION_SECRET: 'test-secret',
              GOOGLE_CLIENT_ID: 'test-google-id',
              GOOGLE_CLIENT_SECRET: 'test-google-secret',
            }),
          ],
        }),
      ],
      providers: [
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
      exports: [DRIZZLE],
    };
  }
}
