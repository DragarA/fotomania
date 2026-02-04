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



describe('CollectionsController (e2e)', () => {
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

  describe('POST /collections', () => {
    it('should create a new collection', async () => {
      const catalogueId = '550e8400-e29b-41d4-a716-446655440000';
      const createDto = {
        name: 'Ceremony Photos',
        catalogueId,
      };

      // Mock catalogue check
      const mockCatalogue = {
        id: catalogueId,
        ownerId: testUser.id,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      // Mock insert
      const mockCollection = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCollection]),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.catalogueId).toBe(createDto.catalogueId);
    });

    it('should return 404 when catalogue not found', async () => {
      const createDto = {
        name: 'Test Collection',
        catalogueId: '550e8400-e29b-41d4-a716-446655440000',
      };

      // Mock catalogue check (not found)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(404);
    });

    it('should return 403 when user does not own catalogue', async () => {
      const catalogueId = '550e8400-e29b-41d4-a716-446655440000';
      const createDto = {
        name: 'Test Collection',
        catalogueId,
      };

      // Mock catalogue check (different owner)
      const mockCatalogue = {
        id: catalogueId,
        ownerId: 'different-user',
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(403);
    });

    it('should return 400 for missing required fields', async () => {
      const createDto = {
        catalogueId: '550e8400-e29b-41d4-a716-446655440000',
        // missing name
      };

      await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /collections', () => {
    it('should return all collections for a catalogue', async () => {
      const catalogueId = 'catalogue-123';

      // Mock catalogue check
      const mockCatalogue = {
        id: catalogueId,
        ownerId: testUser.id,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      // Mock collections query
      const mockCollections = [
        { collection: { id: '1', name: 'Col 1', catalogueId }, photoCount: 5 },
        { collection: { id: '2', name: 'Col 2', catalogueId }, photoCount: 10 },
      ];

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                groupBy: jest.fn().mockResolvedValue(mockCollections),
              }),
            }),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get(`/collections?catalogueId=${catalogueId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('photoCount');
    });

    it('should return 404 when catalogue not found', async () => {
      const catalogueId = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      await request(app.getHttpServer())
        .get(`/collections?catalogueId=${catalogueId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /collections/:id', () => {
    it('should return a collection by ID', async () => {
      const collectionId = 'collection-123';
      const mockResult = {
        collection: { id: collectionId, name: 'Test', catalogueId: 'cat-1' },
        photoCount: 15,
      };

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([mockResult]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .get(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(collectionId);
      expect(response.body.photoCount).toBe(15);
    });

    it('should return 404 when collection not found', async () => {
      const collectionId = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .get(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /collections/:id', () => {
    it('should update a collection', async () => {
      const collectionId = 'collection-123';
      const updateDto = { name: 'Updated Name' };

      // Mock findOne
      const existingCollection = {
        collection: { id: collectionId, name: 'Old Name', catalogueId: 'cat-1' },
        photoCount: 5,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([existingCollection]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      // Mock update
      const updatedCollection = { ...existingCollection.collection, ...updateDto };
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedCollection]),
          }),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .patch(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
    });

    it('should return 404 when collection not found', async () => {
      const collectionId = 'non-existent';
      const updateDto = { name: 'Updated Name' };

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .patch(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /collections/:id', () => {
    it('should delete a collection', async () => {
      const collectionId = 'collection-123';

      // Mock findOne
      const existingCollection = {
        collection: { id: collectionId, name: 'Test', catalogueId: 'cat-1' },
        photoCount: 5,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([existingCollection]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      // Mock delete
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      const response = await request(app.getHttpServer())
        .delete(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Collection deleted successfully');
    });

    it('should return 404 when collection not found', async () => {
      const collectionId = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .delete(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /collections/:id/invoice', () => {
    const mockFindOneDelivery = (collectionId: string) => {
      const existingCollection = {
        collection: {
          id: collectionId,
          name: 'Delivery',
          catalogueId: 'cat-1',
          type: 'delivery',
        },
        photoCount: 5,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([existingCollection]),
                }),
              }),
            }),
          }),
        }),
      } as any);
    };

    it('should upload invoice successfully', async () => {
      const collectionId = 'collection-123';

      mockFindOneDelivery(collectionId);

      // Mock update
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .post(`/collections/${collectionId}/invoice`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake pdf content'), {
          filename: 'invoice.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);

      expect(response.body.message).toBe('Invoice uploaded successfully');
      expect(response.body.hasInvoice).toBe(true);
    });

    it('should reject invalid file type', async () => {
      const collectionId = 'collection-123';

      // Multer file filter errors return 500 by default (unhandled exception)
      await request(app.getHttpServer())
        .post(`/collections/${collectionId}/invoice`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake image content'), {
          filename: 'image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(500);
    });

    it('should return 400 for non-delivery collection', async () => {
      const collectionId = 'collection-123';

      // Mock findOne with proofing type
      const existingCollection = {
        collection: {
          id: collectionId,
          name: 'Proofing',
          catalogueId: 'cat-1',
          type: 'proofing',
        },
        photoCount: 5,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([existingCollection]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .post(`/collections/${collectionId}/invoice`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake pdf content'), {
          filename: 'invoice.pdf',
          contentType: 'application/pdf',
        })
        .expect(400);
    });

    it('should return 404 when collection not found', async () => {
      const collectionId = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .post(`/collections/${collectionId}/invoice`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake pdf content'), {
          filename: 'invoice.pdf',
          contentType: 'application/pdf',
        })
        .expect(404);
    });
  });

  describe('DELETE /collections/:id/invoice', () => {
    it('should remove invoice successfully', async () => {
      const collectionId = 'collection-123';

      // Mock findOne with invoice
      const existingCollection = {
        collection: {
          id: collectionId,
          name: 'Delivery',
          catalogueId: 'cat-1',
          type: 'delivery',
          invoicePath: 'invoices/collection-123/invoice.pdf',
        },
        photoCount: 5,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([existingCollection]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      // Mock update
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .delete(`/collections/${collectionId}/invoice`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Invoice removed successfully');
      expect(response.body.hasInvoice).toBe(false);
    });

    it('should return 404 when no invoice exists', async () => {
      const collectionId = 'collection-123';

      // Mock findOne without invoice
      const existingCollection = {
        collection: {
          id: collectionId,
          name: 'Delivery',
          catalogueId: 'cat-1',
          type: 'delivery',
          invoicePath: null,
        },
        photoCount: 5,
      };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  groupBy: jest.fn().mockResolvedValue([existingCollection]),
                }),
              }),
            }),
          }),
        }),
      } as any);

      await request(app.getHttpServer())
        .delete(`/collections/${collectionId}/invoice`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
