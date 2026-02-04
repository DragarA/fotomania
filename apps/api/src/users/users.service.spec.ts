import { Test, TestingModule } from '@nestjs/testing';

import {
    createDrizzleMock,
    MockDrizzleDB,
    resetDrizzleMock,
} from '../../test/utils/drizzle-mock.factory';
import { TestDataFactory } from '../../test/utils/test-data.factory';
import { DRIZZLE } from '../common/db/drizzle';

import { UsersService } from './users.service';

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
        it('should update user name and return updated user', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                name: 'Updated Name',
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
            });

            // Assert
            expect(result).toBeDefined();
            expect(result).toEqual(updatedUser);
            expect(result!.name).toBe('Updated Name');
            expect(setFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Updated Name',
                    updatedAt: expect.any(Date),
                })
            );
        });

        it('should update business fields', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                businessName: 'Photo Studio Pro',
                businessEmail: 'studio@example.com',
                businessPhone: '+386 1 234 5678',
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
                businessName: 'Photo Studio Pro',
                businessEmail: 'studio@example.com',
                businessPhone: '+386 1 234 5678',
            });

            // Assert
            expect(result).toBeDefined();
            expect(result!.businessName).toBe('Photo Studio Pro');
            expect(result!.businessEmail).toBe('studio@example.com');
            expect(result!.businessPhone).toBe('+386 1 234 5678');
            expect(setFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    businessName: 'Photo Studio Pro',
                    businessEmail: 'studio@example.com',
                    businessPhone: '+386 1 234 5678',
                    updatedAt: expect.any(Date),
                })
            );
        });

        it('should update preferred language', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                preferredLanguage: 'sl',
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
                preferredLanguage: 'sl',
            });

            // Assert
            expect(result).toBeDefined();
            expect(result!.preferredLanguage).toBe('sl');
            expect(setFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    preferredLanguage: 'sl',
                    updatedAt: expect.any(Date),
                })
            );
        });

        it('should set business fields to null when empty string provided', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                businessName: null,
                businessEmail: null,
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
                businessName: '',
                businessEmail: '',
            });

            // Assert
            expect(result).toBeDefined();
            expect(result!.businessName).toBeNull();
            expect(result!.businessEmail).toBeNull();
            expect(setFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    businessName: null,
                    businessEmail: null,
                    updatedAt: expect.any(Date),
                })
            );
        });

        it('should update client info collection toggles', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                collectClientName: true,
                collectClientAddress: true,
                collectClientPhone: false,
                collectClientNotes: true,
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
                collectClientName: true,
                collectClientAddress: true,
                collectClientPhone: false,
                collectClientNotes: true,
            });

            // Assert
            expect(result).toBeDefined();
            expect(result!.collectClientName).toBe(true);
            expect(result!.collectClientAddress).toBe(true);
            expect(result!.collectClientPhone).toBe(false);
            expect(result!.collectClientNotes).toBe(true);
            expect(setFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    collectClientName: true,
                    collectClientAddress: true,
                    collectClientPhone: false,
                    collectClientNotes: true,
                    updatedAt: expect.any(Date),
                })
            );
        });

        it('should update toggles individually', async () => {
            // Arrange
            const updatedUser = TestDataFactory.createUser({
                collectClientName: true,
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
                collectClientName: true,
            });

            // Assert
            expect(result).toBeDefined();
            expect(result!.collectClientName).toBe(true);
            expect(setFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    collectClientName: true,
                    updatedAt: expect.any(Date),
                })
            );
            // Verify other toggles are not in the update payload
            expect(setFn).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    collectClientAddress: expect.anything(),
                })
            );
        });

        it('should verify default values for client info toggles in new user', () => {
            // Arrange & Act
            const newUser = TestDataFactory.createUser();

            // Assert
            expect(newUser.collectClientName).toBe(false);
            expect(newUser.collectClientAddress).toBe(false);
            expect(newUser.collectClientPhone).toBe(false);
            expect(newUser.collectClientNotes).toBe(false);
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
});
