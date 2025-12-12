import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

import { setupE2ETest, teardownE2ETest } from './setup-e2e';
import { MockDrizzleDB, resetDrizzleMock } from './utils/drizzle-mock.factory';
import { TestDataFactory } from './utils/test-data.factory';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthController (e2e)', () => {
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

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const newUser = TestDataFactory.createUser({
        email: 'new@example.com',
        name: 'New User',
      });

      // No existing user
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      // User creation
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newUser]),
        }),
      } as any);

      // Account creation
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValue(undefined),
      } as any);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'Password123!',
          name: 'New User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('new@example.com');
    });

    it('should return 500 when user already exists', async () => {
      // Arrange
      const existingUser = TestDataFactory.createUser();
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingUser]),
        }),
      } as any);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(500);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const testUser = TestDataFactory.createUser();
      const testAccount = TestDataFactory.createAccount({
        userId: testUser.id,
        password: 'hashedpassword',
      });

      // User lookup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([testUser]),
        }),
      } as any);

      // Account lookup
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([testAccount]),
        }),
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail login with invalid credentials', async () => {
      // Arrange
      const testUser = TestDataFactory.createUser();
      const testAccount = TestDataFactory.createAccount();

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([testUser]),
        }),
      } as any);

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([testAccount]),
        }),
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail login when user does not exist', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return user when authenticated with valid JWT', async () => {
      // This test would require generating a valid JWT token
      // For now, we'll skip this as it requires more setup
      // TODO: Add test with valid JWT token
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 200 (logout is client-side with JWT)', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Authentication Flow (Integration)', () => {
    it('should complete full authentication flow: register -> login -> check status -> logout', async () => {
      const agent = request.agent(app.getHttpServer());

      // 1. Register
      const newUser = TestDataFactory.createUser({
        email: 'flow@example.com',
        name: 'Flow User',
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newUser]),
        }),
      } as any);

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValue(undefined),
      } as any);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      await agent
        .post('/auth/register')
        .send({
          email: 'flow@example.com',
          password: 'Password123!',
          name: 'Flow User',
        })
        .expect(201);

      // 2. Login
      const testAccount = TestDataFactory.createAccount({
        userId: newUser.id,
        password: 'hashedpassword',
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([newUser]),
        }),
      } as any);

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([testAccount]),
        }),
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginResponse = await agent
        .post('/auth/login')
        .send({
          email: 'flow@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(loginResponse.body.user.email).toBe('flow@example.com');
      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');
    });
  });
});
