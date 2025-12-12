import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/common/auth/guards/jwt-auth.guard';
import { DRIZZLE } from '../src/common/db/drizzle';

import { teardownE2ETest } from './setup-e2e';
import { MockDrizzleDB, resetDrizzleMock } from './utils/drizzle-mock.factory';
import { createDrizzleMock } from './utils/drizzle-mock.factory';
import { TestDataFactory } from './utils/test-data.factory';



// Create a minimal valid 1x1 PNG image buffer for tests
const createTestImageBuffer = () => {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
};

describe('PhotosController (e2e)', () => {
  let app: INestApplication;
  let mockDb: MockDrizzleDB;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    mockDb = createDrizzleMock();
    testUser = TestDataFactory.createUser({ id: 'test-user-123' });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DRIZZLE)
      .useValue(mockDb)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = testUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: ['http://localhost:5173'],
      credentials: true,
    });
    await app.init();

    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await teardownE2ETest(app);
  });

  beforeEach(() => {
    resetDrizzleMock(mockDb);
    jest.clearAllMocks();
  });

  describe('GET /photos', () => {
    it('should return all photos for a collection', async () => {
      const collectionId = 'collection-123';

      // Mock collection check
      const mockCollection = TestDataFactory.createCollection({
        id: collectionId,
      });
      const mockCatalogue = TestDataFactory.createCatalogue({
        ownerId: testUser.id,
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              { collection: mockCollection, catalogue: mockCatalogue },
            ]),
          }),
        }),
      } as any);

      // Mock photos query
      const mockPhotos = TestDataFactory.createPhotos(2, { collectionId });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockPhotos),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get(`/photos?collectionId=${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should return 404 when collection not found', async () => {
      const collectionId = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .get(`/photos?collectionId=${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /photos/:id', () => {
    it('should return a photo by ID', async () => {
      const photoId = 'photo-123';
      const mockPhoto = TestDataFactory.createPhoto({ id: photoId });
      const mockCatalogue = TestDataFactory.createCatalogue({
        ownerId: testUser.id,
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                { photo: mockPhoto, catalogue: mockCatalogue },
              ]),
            }),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get(`/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(photoId);
    });

    it('should return 404 when photo not found', async () => {
      const photoId = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .get(`/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /photos/:id', () => {
    it('should delete a photo', async () => {
      const photoId = 'photo-123';
      const fs = require('fs');
      const path = require('path');

      // Create temp file for deletion test
      const testDir = path.resolve('./uploads/collections/test-collection');
      const testFile = path.join(testDir, 'photo.jpg');

      // Ensure directory and file exist
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      fs.writeFileSync(testFile, 'test');

      // Use paths that match the created files
      const mockPhoto = TestDataFactory.createPhoto({
        id: photoId,
        storagePath: 'collections/test-collection/photo.jpg',
        thumbnailPath: null, // Avoid thumbnail deletion errors
      });
      const mockCatalogue = TestDataFactory.createCatalogue({
        ownerId: testUser.id,
        coverImage: null, // Ensure this photo isn't the cover
      });

      // Mock findOne
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                { photo: mockPhoto, catalogue: mockCatalogue },
              ]),
            }),
          }),
        }),
      } as any);

      // Mock catalogue cover check (photo is not a cover)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Mock delete
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      const response = await request(app.getHttpServer())
        .delete(`/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Photo deleted successfully');

      // Cleanup - directory should be removed by the service
      if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir, { recursive: true });
      }
    });

    it('should return 404 when photo not found', async () => {
      const photoId = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .delete(`/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /photos/upload/:collectionId', () => {
    it('should upload a photo file', async () => {
      const collectionId = 'collection-123';

      // Mock collection check
      const mockCollection = TestDataFactory.createCollection({
        id: collectionId,
      });
      const mockCatalogue = TestDataFactory.createCatalogue({
        ownerId: testUser.id,
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              { collection: mockCollection, catalogue: mockCatalogue },
            ]),
          }),
        }),
      } as any);

      // Mock insert
      const mockPhoto = TestDataFactory.createPhoto({
        id: 'photo-upload-123',
        collectionId,
      });
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockPhoto]),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .post(`/photos/upload/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', createTestImageBuffer(), 'test.png')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.collectionId).toBe(collectionId);
    });

    it('should return 404 when collection not found', async () => {
      const collectionId = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .post(`/photos/upload/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', createTestImageBuffer(), 'test.png')
        .expect(404);
    });

    it('should return 403 when user does not own collection', async () => {
      const collectionId = 'collection-123';

      const mockCollection = TestDataFactory.createCollection({
        id: collectionId,
      });
      const mockCatalogue = TestDataFactory.createCatalogue({
        ownerId: 'different-user',
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              { collection: mockCollection, catalogue: mockCatalogue },
            ]),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .post(`/photos/upload/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', createTestImageBuffer(), 'test.png')
        .expect(403);
    });
  });
});
