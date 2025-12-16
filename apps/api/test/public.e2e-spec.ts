import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { DRIZZLE } from '../src/common/db/drizzle';

import { teardownE2ETest } from './setup-e2e';
import { MockDrizzleDB, resetDrizzleMock, createDrizzleMock } from './utils/drizzle-mock.factory';
import { TestDataFactory } from './utils/test-data.factory';

describe('PublicController (e2e)', () => {
  let app: INestApplication;
  let mockDb: MockDrizzleDB;
  let jwtService: JwtService;

  beforeAll(async () => {
    mockDb = createDrizzleMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DRIZZLE)
      .useValue(mockDb)
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: ['http://localhost:5173'],
      credentials: true,
    });
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await teardownE2ETest(app);
  });

  afterEach(() => {
    resetDrizzleMock(mockDb);
  });

  // Helper to mock password protection check
  const mockPasswordProtectionCheck = (password: string | null) => {
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ password }]),
      }),
    } as any);
  };

  describe('POST /public/catalogue/:slug/verify', () => {
    it('should return access token for correct password', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      const mockCatalogue = TestDataFactory.createCatalogue({
        publicUrlSlug: 'protected-wedding',
        password: hashedPassword,
      });

      // Mock password lookup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: mockCatalogue.id, password: hashedPassword },
          ]),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .post('/public/catalogue/protected-wedding/verify')
        .send({ password: 'secret123' })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      
      // Verify the token is valid
      const payload = jwtService.verify(response.body.accessToken);
      expect(payload.slug).toBe('protected-wedding');
      expect(payload.type).toBe('public-access');
    });

    it('should return 401 for incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      const mockCatalogue = TestDataFactory.createCatalogue({
        publicUrlSlug: 'protected-wedding',
        password: hashedPassword,
      });

      // Mock password lookup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: mockCatalogue.id, password: hashedPassword },
          ]),
        }),
      } as any);

      await request(app.getHttpServer())
        .post('/public/catalogue/protected-wedding/verify')
        .send({ password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 404 for non-existent catalogue', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      await request(app.getHttpServer())
        .post('/public/catalogue/non-existent/verify')
        .send({ password: 'anypassword' })
        .expect(404);
    });

    it('should return token for catalogue without password', async () => {
      const mockCatalogue = TestDataFactory.createCatalogue({
        publicUrlSlug: 'open-wedding',
        password: null,
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: mockCatalogue.id, password: null },
          ]),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .post('/public/catalogue/open-wedding/verify')
        .send({ password: '' })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
    });
  });

  describe('GET /public/catalogue/:slug', () => {
    it('should return public catalogue data for unprotected catalogue', async () => {
      const mockCatalogue = TestDataFactory.createCatalogue({
        publicUrlSlug: 'wedding-2024',
        title: 'Wedding 2024',
        password: null,
      });
      const mockCollection = TestDataFactory.createCollection({
        name: 'Ceremony',
        catalogueId: mockCatalogue.id,
      });

      // First select - password protection check (guard)
      mockPasswordProtectionCheck(null);

      // Second select - catalogue with collections
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              { catalogue: mockCatalogue, collection: mockCollection },
            ]),
          }),
        }),
      } as any);

      // Third select - collections with photos
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              having: jest.fn().mockReturnValue({
                groupBy: jest.fn().mockResolvedValue([
                  { collection: mockCollection },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get('/public/catalogue/wedding-2024')
        .expect(200);

      expect(response.body.title).toBe('Wedding 2024');
      expect(response.body.publicUrlSlug).toBe('wedding-2024');
      expect(response.body.collections).toBeDefined();
      expect(response.body.collections).toHaveLength(1);
      expect(response.body.collections[0].name).toBe('Ceremony');
    });

    it('should return 401 for password protected catalogue without token', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);

      // Password protection check (guard)
      mockPasswordProtectionCheck(hashedPassword);

      await request(app.getHttpServer())
        .get('/public/catalogue/protected-wedding')
        .expect(401);
    });

    it('should return catalogue data for password protected catalogue with valid token', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      const mockCatalogue = TestDataFactory.createCatalogue({
        publicUrlSlug: 'protected-wedding',
        title: 'Protected Wedding',
        password: hashedPassword,
      });
      const mockCollection = TestDataFactory.createCollection({
        name: 'Ceremony',
        catalogueId: mockCatalogue.id,
      });

      // Generate a valid token
      const token = jwtService.sign({
        slug: 'protected-wedding',
        type: 'public-access',
      });

      // Password protection check (guard)
      mockPasswordProtectionCheck(hashedPassword);

      // Catalogue with collections
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              { catalogue: mockCatalogue, collection: mockCollection },
            ]),
          }),
        }),
      } as any);

      // Collections with photos
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              having: jest.fn().mockReturnValue({
                groupBy: jest.fn().mockResolvedValue([
                  { collection: mockCollection },
                ]),
              }),
            }),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get('/public/catalogue/protected-wedding')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.title).toBe('Protected Wedding');
    });

    it('should return 401 for password protected catalogue with invalid token', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);

      // Password protection check (guard)
      mockPasswordProtectionCheck(hashedPassword);

      await request(app.getHttpServer())
        .get('/public/catalogue/protected-wedding')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 for password protected catalogue with token for different slug', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);

      // Generate a token for a different slug
      const token = jwtService.sign({
        slug: 'different-slug',
        type: 'public-access',
      });

      // Password protection check (guard)
      mockPasswordProtectionCheck(hashedPassword);

      await request(app.getHttpServer())
        .get('/public/catalogue/protected-wedding')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should return 404 when catalogue not found', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      await request(app.getHttpServer())
        .get('/public/catalogue/non-existent-slug')
        .expect(404);
    });
  });

  describe('GET /public/catalogue/:slug/collection/:collectionId/photos', () => {
    it('should return photos for a collection (unprotected)', async () => {
      const mockCatalogue = TestDataFactory.createCatalogue({
        publicUrlSlug: 'wedding-2024',
        password: null,
      });
      const mockCollection = TestDataFactory.createCollection({
        id: 'collection-123',
        catalogueId: mockCatalogue.id,
      });
      const mockPhotos = [
        TestDataFactory.createPhoto({
          originalFileName: 'photo1.jpg',
          collectionId: mockCollection.id,
        }),
        TestDataFactory.createPhoto({
          originalFileName: 'photo2.jpg',
          collectionId: mockCollection.id,
        }),
      ];

      // Password protection check (guard)
      mockPasswordProtectionCheck(null);

      // First select - verify collection and catalogue
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              { collection: mockCollection, catalogue: mockCatalogue },
            ]),
          }),
        }),
      } as any);

      // Second select - get photos
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockPhotos),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get('/public/catalogue/wedding-2024/collection/collection-123/photos')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].originalFileName).toBe('photo1.jpg');
      expect(response.body[1].originalFileName).toBe('photo2.jpg');
    });

    it('should return 401 for protected catalogue without token', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);

      // Password protection check (guard)
      mockPasswordProtectionCheck(hashedPassword);

      await request(app.getHttpServer())
        .get('/public/catalogue/protected-wedding/collection/collection-123/photos')
        .expect(401);
    });

    it('should return 404 when collection not found', async () => {
      // Password protection check (guard)
      mockPasswordProtectionCheck(null);

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .get('/public/catalogue/wedding-2024/collection/non-existent/photos')
        .expect(404);
    });
  });

  describe('POST /public/catalogue/:slug/favourites', () => {
    it('should add favourites successfully (unprotected)', async () => {
      const mockCatalogue = TestDataFactory.createCatalogue({
        publicUrlSlug: 'wedding-2024',
        password: null,
      });

      // Password protection check (guard)
      mockPasswordProtectionCheck(null);

      // Mock catalogue lookup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                { id: mockCatalogue.id },
              ]),
            }),
          }),
        }),
      } as any);

      // Mock photo count validation
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue([{ photoCount: 3 }]),
            }),
          }),
        }),
      } as any);

      // Mock existing session lookup (no existing session)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Mock session insert
      const mockSession = {
        id: 'session-123',
        email: 'test@example.com',
        catalogueId: mockCatalogue.id,
      };
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockReturnValue({
            then: jest.fn().mockResolvedValue(mockSession),
          }),
        }),
      } as any);

      // Mock delete existing favourites
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      // Mock favourites insert
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValue(undefined),
      } as any);

      const response = await request(app.getHttpServer())
        .post('/public/catalogue/wedding-2024/favourites')
        .send({
          email: 'test@example.com',
          photoIds: ['photo-1', 'photo-2', 'photo-3'],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 for protected catalogue without token', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);

      // Password protection check (guard)
      mockPasswordProtectionCheck(hashedPassword);

      await request(app.getHttpServer())
        .post('/public/catalogue/protected-wedding/favourites')
        .send({
          email: 'test@example.com',
          photoIds: ['photo-1'],
        })
        .expect(401);
    });

    it('should validate request body - missing email', async () => {
      // Password protection check (guard)
      mockPasswordProtectionCheck(null);

      await request(app.getHttpServer())
        .post('/public/catalogue/wedding-2024/favourites')
        .send({
          photoIds: ['photo-1'],
        })
        .expect(400);
    });

    it('should validate request body - missing photoIds', async () => {
      // Password protection check (guard)
      mockPasswordProtectionCheck(null);

      await request(app.getHttpServer())
        .post('/public/catalogue/wedding-2024/favourites')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });
});
