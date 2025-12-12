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

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      // Arrange
      const testUsers = TestDataFactory.createUsers(3);
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(testUsers),
      } as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      } as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user by ID', async () => {
      // Arrange
      const testUser = TestDataFactory.createUser({
        id: 'test-user-123',
        email: 'specific@example.com',
        name: 'Specific User',
      });
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([testUser]),
        }),
      } as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users/test-user-123')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'test-user-123');
      expect(response.body).toHaveProperty('email', 'specific@example.com');
      expect(response.body).toHaveProperty('name', 'Specific User');
    });

    it('should handle when user not found gracefully', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users/nonexistent-id')
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /users/:id', () => {
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
        .patch('/users/test-user-123')
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated Name');
    });

    it('should update user email', async () => {
      // Arrange
      const updatedUser = TestDataFactory.createUser({
        id: 'test-user-123',
        email: 'newemail@example.com',
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
        .patch('/users/test-user-123')
        .send({ email: 'newemail@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('email', 'newemail@example.com');
    });

    it('should update both name and email', async () => {
      // Arrange
      const updatedUser = TestDataFactory.createUser({
        id: 'test-user-123',
        name: 'New Name',
        email: 'new@example.com',
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
        .patch('/users/test-user-123')
        .send({
          name: 'New Name',
          email: 'new@example.com',
        })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'New Name');
      expect(response.body).toHaveProperty('email', 'new@example.com');
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
        .patch('/users/test-user-123')
        .send({})
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user by ID', async () => {
      // Arrange
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      // Act & Assert
      await request(app.getHttpServer())
        .delete('/users/test-user-123')
        .expect(200);
    });

    it('should not throw error when deleting nonexistent user', async () => {
      // Arrange
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      // Act & Assert
      await request(app.getHttpServer())
        .delete('/users/nonexistent-id')
        .expect(200);
    });
  });

  describe('Users CRUD Flow (Integration)', () => {
    it('should handle complete CRUD operations', async () => {
      // 1. Get all users (initially empty)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([]),
      } as any);
      let response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);
      expect(response.body).toHaveLength(0);

      // 2. Create user implicitly tested via auth (not part of UsersController)

      // 3. Get all users (with one user)
      const user = TestDataFactory.createUser({ id: 'user-1' });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([user]),
      } as any);
      response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);
      expect(response.body).toHaveLength(1);

      // 4. Get single user
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([user]),
        }),
      } as any);
      response = await request(app.getHttpServer())
        .get('/users/user-1')
        .expect(200);
      expect(response.body.id).toBe('user-1');

      // 5. Update user
      const updatedUser = TestDataFactory.createUser({
        id: 'user-1',
        name: 'Updated Name',
      });
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      } as any);
      response = await request(app.getHttpServer())
        .patch('/users/user-1')
        .send({ name: 'Updated Name' })
        .expect(200);
      expect(response.body.name).toBe('Updated Name');

      // 6. Delete user
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);
      await request(app.getHttpServer())
        .delete('/users/user-1')
        .expect(200);

      // 7. Verify user deleted
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);
      response = await request(app.getHttpServer())
        .get('/users/user-1')
        .expect(200);
      expect(response.body).toEqual({});
    });
  });
});
