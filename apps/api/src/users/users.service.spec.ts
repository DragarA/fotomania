import { Test, TestingModule } from '@nestjs/testing';

import {
  createDrizzleMock,
  MockDrizzleDB,
  resetDrizzleMock,
} from '../../test/utils/drizzle-mock.factory';
import { TestDataFactory } from '../../test/utils/test-data.factory';

import { UsersService } from './users.service';
import { DRIZZLE } from '../common/db/drizzle';

describe('UsersService', () => {
  let service: UsersService;
  let mockDb: MockDrizzleDB;

  beforeEach(async () => {
    mockDb = createDrizzleMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetDrizzleMock(mockDb);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // Arrange
      const testUsers = TestDataFactory.createUsers(3);
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(testUsers),
      } as any);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(testUsers);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      } as any);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      // Arrange
      const testUser = TestDataFactory.createUser();
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([testUser]),
        }),
      } as any);

      // Act
      const result = await service.findOne('test-user-id-1');

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(testUser);
      expect(result!.id).toBe('test-user-id-1');
    });

    it('should return undefined when user not found', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      // Act
      const result = await service.findOne('nonexistent-id');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      // Arrange
      const testUser = TestDataFactory.createUser({
        email: 'specific@example.com',
      });
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([testUser]),
        }),
      } as any);

      // Act
      const result = await service.findByEmail('specific@example.com');

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(testUser);
      expect(result!.email).toBe('specific@example.com');
    });

    it('should return undefined when user with email not found', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      // Act
      const result = await service.findByEmail('notfound@example.com');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update user and return updated user', async () => {
      // Arrange
      const updatedUser = TestDataFactory.createUser({
        name: 'Updated Name',
        email: 'updated@example.com',
      });
      const setFn = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([updatedUser]),
        }),
      });
      mockDb.update.mockReturnValue({
        set: setFn,
      } as any);

      // Act
      const result = await service.update('test-user-id-1', {
        name: 'Updated Name',
        email: 'updated@example.com',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(updatedUser);
      expect(result!.name).toBe('Updated Name');
      expect(result!.email).toBe('updated@example.com');
      expect(setFn).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
          email: 'updated@example.com',
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should update only provided fields', async () => {
      // Arrange
      const updatedUser = TestDataFactory.createUser({
        name: 'New Name Only',
      });
      const setFn = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([updatedUser]),
        }),
      });
      mockDb.update.mockReturnValue({
        set: setFn,
      } as any);

      // Act
      const result = await service.update('test-user-id-1', {
        name: 'New Name Only',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result!.name).toBe('New Name Only');
      expect(setFn).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name Only',
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should always update the updatedAt timestamp', async () => {
      // Arrange
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      const updatedUser = TestDataFactory.createUser();
      const setFn = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([updatedUser]),
        }),
      });
      mockDb.update.mockReturnValue({
        set: setFn,
      } as any);

      // Act
      await service.update('test-user-id-1', { name: 'Test' });

      // Assert
      expect(setFn).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: now,
        })
      );

      jest.restoreAllMocks();
    });
  });

  describe('remove', () => {
    it('should delete a user by ID', async () => {
      // Arrange
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      // Act
      await service.remove('test-user-id-1');

      // Assert
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when deleting nonexistent user', async () => {
      // Arrange
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      // Act & Assert
      await expect(service.remove('nonexistent-id')).resolves.not.toThrow();
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });
  });
});
