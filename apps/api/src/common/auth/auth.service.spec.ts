import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import {
    createDrizzleMock,
    MockDrizzleDB,
    resetDrizzleMock,
} from '../../../test/utils/drizzle-mock.factory';
import { TestDataFactory } from '../../../test/utils/test-data.factory';
import { DRIZZLE } from '../db/drizzle';

import { AuthService } from './auth.service';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let mockDb: MockDrizzleDB;

    beforeEach(async () => {
        mockDb = createDrizzleMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: DRIZZLE,
                    useValue: mockDb,
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-jwt-token'),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'JWT_SECRET') return 'test-secret';
                            if (key === 'JWT_REFRESH_SECRET')
                                return 'test-refresh-secret';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        resetDrizzleMock(mockDb);
    });

    describe('validateUser', () => {
        it('should return user when credentials are valid', async () => {
            // Arrange
            const testUser = TestDataFactory.createUser();
            const testAccount = TestDataFactory.createAccount({
                userId: testUser.id,
                password: 'hashedpassword',
            });

            mockDb.select
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([testUser]),
                    }),
                } as any)
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([testAccount]),
                    }),
                } as any);

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Act
            const result = await service.validateUser(
                'test@example.com',
                'password'
            );

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(testUser.id);
            expect(result.email).toBe(testUser.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'password',
                'hashedpassword'
            );
        });

        it('should return null when user does not exist', async () => {
            // Arrange
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            // Act
            const result = await service.validateUser(
                'nonexistent@example.com',
                'password'
            );

            // Assert
            expect(result).toBeNull();
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return null when account has no password', async () => {
            // Arrange
            const testUser = TestDataFactory.createUser();
            const testAccount = TestDataFactory.createAccount({
                userId: testUser.id,
                password: null,
            });

            mockDb.select
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([testUser]),
                    }),
                } as any)
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([testAccount]),
                    }),
                } as any);

            // Act
            const result = await service.validateUser(
                'test@example.com',
                'password'
            );

            // Assert
            expect(result).toBeNull();
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return null when password does not match', async () => {
            // Arrange
            const testUser = TestDataFactory.createUser();
            const testAccount = TestDataFactory.createAccount();

            mockDb.select
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([testUser]),
                    }),
                } as any)
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([testAccount]),
                    }),
                } as any);

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act
            const result = await service.validateUser(
                'test@example.com',
                'wrongpassword'
            );

            // Assert
            expect(result).toBeNull();
            expect(bcrypt.compare).toHaveBeenCalled();
        });
    });

    describe('registerUser', () => {
        it('should successfully register a new user', async () => {
            // Arrange
            const newUser = TestDataFactory.createUser({
                id: 'new-user-id',
                email: 'new@example.com',
                name: 'New User',
            });

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            mockDb.transaction.mockImplementation(
                async (cb: any) => cb(mockDb)
            );

            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([newUser]),
                }),
            } as any);

            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

            // Act
            const result = await service.registerUser(
                'new@example.com',
                'password123',
                'New User'
            );

            // Assert
            expect(result).toBeDefined();
            expect(result!.email).toBe('new@example.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        });

        it('should throw error when user already exists', async () => {
            // Arrange
            const existingUser = TestDataFactory.createUser();
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([existingUser]),
                }),
            } as any);

            // Act & Assert
            await expect(
                service.registerUser('test@example.com', 'password', 'Test')
            ).rejects.toThrow('User already exists');
        });
    });

    describe('findUserById', () => {
        it('should find and return a user by ID', async () => {
            // Arrange
            const testUser = TestDataFactory.createUser();
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([testUser]),
                }),
            } as any);

            // Act
            const result = await service.findUserById('test-user-id-1');

            // Assert
            expect(result).toBeDefined();
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
            const result = await service.findUserById('nonexistent-id');

            // Assert
            expect(result).toBeUndefined();
        });
    });
});
