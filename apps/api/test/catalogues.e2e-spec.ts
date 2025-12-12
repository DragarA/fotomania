import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/common/auth/guards/jwt-auth.guard';
import { DRIZZLE } from '../src/common/db/drizzle';

import { teardownE2ETest } from './setup-e2e';
import { MockDrizzleDB, resetDrizzleMock } from './utils/drizzle-mock.factory';
import { createDrizzleMock } from './utils/drizzle-mock.factory';
import { TestDataFactory } from './utils/test-data.factory';



describe('CataloguesController (e2e)', () => {
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
          req.user = testUser; // Mock the user object
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

    authToken = 'mock-jwt-token'; // Not used since guard is mocked
  });

  afterAll(async () => {
    await teardownE2ETest(app);
  });

  beforeEach(() => {
    resetDrizzleMock(mockDb);
    jest.clearAllMocks();
  });

  describe('POST /catalogues', () => {
    it('should create a new catalogue', async () => {
      const createDto = {
        title: 'Summer Wedding 2024',
        description: 'Beautiful moments',
      };

      // Mock insert
      const mockCatalogue = {
        id: 'catalogue-123',
        ...createDto,
        publicUrlSlug: 'auto-generated-uuid',
        ownerId: testUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .post('/catalogues')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createDto.title);
      expect(response.body.publicUrlSlug).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const createDto = {
        description: 'Missing title',
      };

      await request(app.getHttpServer())
        .post('/catalogues')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /catalogues', () => {
    it('should return all catalogues for the authenticated user', async () => {
      const mockCatalogues = [
        { catalogue: TestDataFactory.createCatalogue({ ownerId: testUser.id }), photoCount: 5 },
        { catalogue: TestDataFactory.createCatalogue({ ownerId: testUser.id }), photoCount: 10 },
      ];

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue(mockCatalogues),
              }),
            }),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get('/catalogues')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('photoCount');
    });
  });

  describe('GET /catalogues/:id', () => {
    it('should return a catalogue by ID', async () => {
      const mockCatalogue = TestDataFactory.createCatalogue({
        id: 'catalogue-123',
        ownerId: testUser.id,
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get('/catalogues/catalogue-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe('catalogue-123');
    });

    it('should return 404 when catalogue not found', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      await request(app.getHttpServer())
        .get('/catalogues/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /catalogues/slug/:slug', () => {
    it('should return a catalogue by public slug (no auth required)', async () => {
      const mockCatalogue = TestDataFactory.createCatalogue({
        publicUrlSlug: 'test-slug',
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get('/catalogues/slug/test-slug')
        .expect(200);

      expect(response.body.publicUrlSlug).toBe('test-slug');
    });

    it('should return 404 when slug not found', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      await request(app.getHttpServer())
        .get('/catalogues/slug/non-existent')
        .expect(404);
    });
  });

  describe('PATCH /catalogues/:id', () => {
    it('should update a catalogue', async () => {
      const updateDto = { title: 'Updated Title' };
      const existingCatalogue = TestDataFactory.createCatalogue({
        id: 'catalogue-123',
        ownerId: testUser.id,
        title: 'Old Title',
      });

      // Mock findOne
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingCatalogue]),
        }),
      } as any);

      // Mock update
      const updatedCatalogue = { ...existingCatalogue, ...updateDto };
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedCatalogue]),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .patch('/catalogues/catalogue-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('should return 403 when user does not own catalogue', async () => {
      const updateDto = { title: 'Updated Title' };

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: 'catalogue-123', ownerId: 'different-user' },
          ]),
        }),
      } as any);

      await request(app.getHttpServer())
        .patch('/catalogues/catalogue-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(403);
    });
  });

  describe('DELETE /catalogues/:id', () => {
    it('should delete a catalogue', async () => {
      const mockCatalogue = TestDataFactory.createCatalogue({
        id: 'catalogue-123',
        ownerId: testUser.id,
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      const response = await request(app.getHttpServer())
        .delete('/catalogues/catalogue-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Catalogue deleted successfully');
    });

    it('should return 403 when user does not own catalogue', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: 'catalogue-123', ownerId: 'different-user' },
          ]),
        }),
      } as any);

      await request(app.getHttpServer())
        .delete('/catalogues/catalogue-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
