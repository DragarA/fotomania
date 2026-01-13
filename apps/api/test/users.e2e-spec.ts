import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { setupE2ETest, teardownE2ETest } from './setup-e2e';
import { MockDrizzleDB, resetDrizzleMock } from './utils/drizzle-mock.factory';
import { TestDataFactory } from './utils/test-data.factory';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let mockDb: MockDrizzleDB;

    beforeAll(async () => {
        const setup = await setupE2ETest();
        app = setup.app;
        mockDb = setup.mockDb;
    });

    afterAll(async () => {
        await teardownE2ETest(app);
    });

    beforeEach(() => {
        resetDrizzleMock(mockDb);
        jest.clearAllMocks();
    });

    describe('GET /users/me', () => {
        it('should return the current user profile', async () => {
            // Arrange
            const testUser = TestDataFactory.createUser({
                id: 'test-user-123',
                email: 'test@example.com',
                name: 'Test User',
                businessName: 'Test Business',
                businessEmail: 'business@example.com',
                preferredLanguage: 'en',
            });
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([testUser]),
                }),
            } as any);

            // Act & Assert
            const response = await request(app.getHttpServer())
                .get('/users/me')
                .expect(200);

            expect(response.body).toHaveProperty('id', 'test-user-123');
            expect(response.body).toHaveProperty('email', 'test@example.com');
            expect(response.body).toHaveProperty('name', 'Test User');
            expect(response.body).toHaveProperty('businessName', 'Test Business');
            expect(response.body).toHaveProperty('businessEmail', 'business@example.com');
            expect(response.body).toHaveProperty('preferredLanguage', 'en');
        });

        it('should return user with all business fields', async () => {
            // Arrange
            const testUser = TestDataFactory.createUser({
                id: 'test-user-123',
                businessName: 'Photo Studio Pro',
                businessAddress: '123 Main Street',
                businessPhone: '+386 1 234 5678',
                businessEmail: 'contact@photostudio.com',
                businessWebsite: 'https://photostudio.com',
                businessLogo: 'https://example.com/logo.png',
                businessDescription: 'Professional photography services',
                preferredLanguage: 'sl',
            });
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([testUser]),
                }),
            } as any);

            // Act & Assert
            const response = await request(app.getHttpServer())
                .get('/users/me')
                .expect(200);

            expect(response.body).toHaveProperty('businessName', 'Photo Studio Pro');
            expect(response.body).toHaveProperty('businessAddress', '123 Main Street');
            expect(response.body).toHaveProperty('businessPhone', '+386 1 234 5678');
            expect(response.body).toHaveProperty('businessEmail', 'contact@photostudio.com');
            expect(response.body).toHaveProperty('businessWebsite', 'https://photostudio.com');
            expect(response.body).toHaveProperty('businessLogo', 'https://example.com/logo.png');
            expect(response.body).toHaveProperty('businessDescription', 'Professional photography services');
            expect(response.body).toHaveProperty('preferredLanguage', 'sl');
        });
    });

    describe('PATCH /users/me', () => {
        it('should update user name', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                id: 'test-user-123',
                name: 'Updated Name',
                email: 'test@example.com',
            });
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedUser]),
                    }),
                }),
            } as any);

            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({ name: 'Updated Name' })
                .expect(200);

            expect(response.body).toHaveProperty('name', 'Updated Name');
        });

        it('should update business fields', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                id: 'test-user-123',
                businessName: 'New Business Name',
                businessAddress: '456 New Street',
                businessPhone: '+386 2 345 6789',
                businessEmail: 'new@business.com',
                businessWebsite: 'https://newbusiness.com',
                businessDescription: 'Updated description',
            });
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedUser]),
                    }),
                }),
            } as any);

            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({
                    businessName: 'New Business Name',
                    businessAddress: '456 New Street',
                    businessPhone: '+386 2 345 6789',
                    businessEmail: 'new@business.com',
                    businessWebsite: 'https://newbusiness.com',
                    businessDescription: 'Updated description',
                })
                .expect(200);

            expect(response.body).toHaveProperty('businessName', 'New Business Name');
            expect(response.body).toHaveProperty('businessAddress', '456 New Street');
            expect(response.body).toHaveProperty('businessPhone', '+386 2 345 6789');
            expect(response.body).toHaveProperty('businessEmail', 'new@business.com');
            expect(response.body).toHaveProperty('businessWebsite', 'https://newbusiness.com');
            expect(response.body).toHaveProperty('businessDescription', 'Updated description');
        });

        it('should update preferred language', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                id: 'test-user-123',
                preferredLanguage: 'sl',
            });
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedUser]),
                    }),
                }),
            } as any);

            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({ preferredLanguage: 'sl' })
                .expect(200);

            expect(response.body).toHaveProperty('preferredLanguage', 'sl');
        });

        it('should reject invalid preferred language', async () => {
            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({ preferredLanguage: 'invalid' })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('should reject invalid business email format', async () => {
            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({ businessEmail: 'not-an-email' })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('should reject invalid business website URL', async () => {
            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({ businessWebsite: 'not-a-url' })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('should allow clearing business fields with null', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                id: 'test-user-123',
                businessName: null,
                businessEmail: null,
            });
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedUser]),
                    }),
                }),
            } as any);

            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({
                    businessName: null,
                    businessEmail: null,
                })
                .expect(200);

            expect(response.body).toHaveProperty('businessName', null);
            expect(response.body).toHaveProperty('businessEmail', null);
        });

        it('should handle empty update body', async () => {
            // Arrange
            const user = TestDataFactory.createUser();
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([user]),
                    }),
                }),
            } as any);

            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({})
                .expect(200);

            expect(response.body).toBeDefined();
        });

        it('should update multiple fields at once', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                id: 'test-user-123',
                name: 'New Name',
                businessName: 'New Business',
                preferredLanguage: 'sl',
            });
            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedUser]),
                    }),
                }),
            } as any);

            // Act & Assert
            const response = await request(app.getHttpServer())
                .patch('/users/me')
                .send({
                    name: 'New Name',
                    businessName: 'New Business',
                    preferredLanguage: 'sl',
                })
                .expect(200);

            expect(response.body).toHaveProperty('name', 'New Name');
            expect(response.body).toHaveProperty('businessName', 'New Business');
            expect(response.body).toHaveProperty('preferredLanguage', 'sl');
        });
    });
});
