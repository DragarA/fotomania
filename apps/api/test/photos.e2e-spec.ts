import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { MockDrizzleDB, resetDrizzleMock } from './utils/drizzle-mock.factory';
import { TestDataFactory } from './utils/test-data.factory';
import { teardownE2ETest } from './setup-e2e';
import { AppModule } from '../src/app.module';
import { DRIZZLE } from '../src/common/db/drizzle';
import { createDrizzleMock } from './utils/drizzle-mock.factory';
import { JwtAuthGuard } from '../src/common/auth/guards/jwt-auth.guard';

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

  describe('POST /photos', () => {
    it('should create a new photo', async () => {
      const collectionId = '550e8400-e29b-41d4-a716-446655440000';
      const createDto = {
        originalFileName: 'wedding-001.jpg',
        storagePath: '/uploads/test/wedding-001.jpg',
        mimeType: 'image/jpeg',
        thumbnailPath: '/uploads/test/thumbnails/wedding-001.jpg',
        width: 1920,
        height: 1080,
        size: 2048576,
        collectionId,
      };

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
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...createDto,
      });

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockPhoto]),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .post('/photos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.originalFileName).toBe(createDto.originalFileName);
      expect(response.body.collectionId).toBe(createDto.collectionId);
    });

    it('should return 404 when collection not found', async () => {
      const createDto = {
        originalFileName: 'wedding-001.jpg',
        storagePath: '/uploads/test/wedding-001.jpg',
        mimeType: 'image/jpeg',
        collectionId: '550e8400-e29b-41d4-a716-446655440000',
      };

      // Mock collection check (not found)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .post('/photos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(404);
    });

    it('should return 403 when user does not own collection', async () => {
      const collectionId = '550e8400-e29b-41d4-a716-446655440000';
      const createDto = {
        originalFileName: 'wedding-001.jpg',
        storagePath: '/uploads/test/wedding-001.jpg',
        mimeType: 'image/jpeg',
        collectionId,
      };

      // Mock collection check (different owner)
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
        .post('/photos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(403);
    });

    it('should return 400 for missing required fields', async () => {
      const createDto = {
        collectionId: '550e8400-e29b-41d4-a716-446655440000',
        // missing required fields
      };

      await request(app.getHttpServer())
        .post('/photos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });
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

  describe('PATCH /photos/:id', () => {
    it('should update a photo', async () => {
      const photoId = 'photo-123';
      const updateDto = { originalFileName: 'updated-photo.jpg' };

      // Mock findOne
      const existingPhoto = TestDataFactory.createPhoto({
        id: photoId,
        originalFileName: 'old-photo.jpg',
      });
      const mockCatalogue = TestDataFactory.createCatalogue({
        ownerId: testUser.id,
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                { photo: existingPhoto, catalogue: mockCatalogue },
              ]),
            }),
          }),
        }),
      } as any);

      // Mock update
      const updatedPhoto = { ...existingPhoto, ...updateDto };
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedPhoto]),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .patch(`/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.originalFileName).toBe(updateDto.originalFileName);
    });

    it('should return 404 when photo not found', async () => {
      const photoId = 'non-existent';
      const updateDto = { originalFileName: 'updated-photo.jpg' };

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
        .patch(`/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /photos/:id', () => {
    it('should delete a photo', async () => {
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

      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      const response = await request(app.getHttpServer())
        .delete(`/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Photo deleted successfully');
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
});
