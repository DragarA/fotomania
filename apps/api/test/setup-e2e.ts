import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { createDrizzleMock } from './utils/drizzle-mock.factory';
import { DRIZZLE } from '../src/common/db/drizzle';

/**
 * Setup function for e2e tests
 * Creates a test application with mocked database
 */
export async function setupE2ETest(drizzleMock?: any) {
  const mockDb = drizzleMock || createDrizzleMock();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DRIZZLE)
    .useValue(mockDb)
    .compile();

  const app: INestApplication = moduleFixture.createNestApplication();

  // Enable CORS for tests
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  await app.init();

  return { app, mockDb, moduleFixture };
}

/**
 * Cleanup function for e2e tests
 */
export async function teardownE2ETest(app: INestApplication) {
  await app.close();
}
