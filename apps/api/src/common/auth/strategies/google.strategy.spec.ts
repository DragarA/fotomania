import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import {
    createDrizzleMock,
    MockDrizzleDB,
    resetDrizzleMock,
} from '../../../../test/utils/drizzle-mock.factory';
import { TestDataFactory } from '../../../../test/utils/test-data.factory';
import { DRIZZLE } from '../../db/drizzle';

import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
    let strategy: GoogleStrategy;
    let mockDb: MockDrizzleDB;

    beforeEach(async () => {
        mockDb = createDrizzleMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GoogleStrategy,
                {
                    provide: DRIZZLE,
                    useValue: mockDb,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config: Record<string, string> = {
                                GOOGLE_CLIENT_ID: 'test-client-id',
                                GOOGLE_CLIENT_SECRET: 'test-client-secret',
                            };
                            return config[key];
                        }),
                    },
                },
            ],
        }).compile();

        strategy = module.get<GoogleStrategy>(GoogleStrategy);
    });

    afterEach(() => {
        jest.clearAllMocks();
        resetDrizzleMock(mockDb);
    });

    describe('validate', () => {
        it('should create new user when user does not exist', async () => {
            // Arrange
            const googleProfile = TestDataFactory.createGoogleProfile();
            const newUser = TestDataFactory.createUser({
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: true,
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

            // No existing account
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            // Account creation
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            const done = jest.fn();

            // Act
            await strategy.validate(
                'access-token',
                'refresh-token',
                googleProfile,
                done
            );

            // Assert
            expect(done).toHaveBeenCalledWith(null, newUser);
        });

        it('should link Google account to existing user', async () => {
            // Arrange
            const googleProfile = TestDataFactory.createGoogleProfile();
            const existingUser = TestDataFactory.createUser();

            // User exists
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([existingUser]),
                }),
            } as any);

            // No Google account linked
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            // Account creation
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            const done = jest.fn();

            // Act
            await strategy.validate(
                'access-token',
                'refresh-token',
                googleProfile,
                done
            );

            // Assert
            expect(done).toHaveBeenCalledWith(null, existingUser);
        });

        it('should return existing user when already linked', async () => {
            // Arrange
            const googleProfile = TestDataFactory.createGoogleProfile();
            const existingUser = TestDataFactory.createUser();
            const existingAccount = TestDataFactory.createAccount({
                providerId: 'google',
                userId: existingUser.id,
            });

            // User exists
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([existingUser]),
                }),
            } as any);

            // Account exists
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([existingAccount]),
                }),
            } as any);

            const done = jest.fn();

            // Act
            await strategy.validate(
                'access-token',
                'refresh-token',
                googleProfile,
                done
            );

            // Assert
            expect(done).toHaveBeenCalledWith(null, existingUser);
        });

        it('should handle error when no email in profile', async () => {
            // Arrange
            const googleProfile = TestDataFactory.createGoogleProfile({
                emails: [],
            });

            const done = jest.fn();

            // Act
            await strategy.validate(
                'access-token',
                'refresh-token',
                googleProfile,
                done
            );

            // Assert
            expect(done).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'No email found',
                }),
                undefined
            );
        });

        it('should store access and refresh tokens', async () => {
            // Arrange
            const googleProfile = TestDataFactory.createGoogleProfile();
            const existingUser = TestDataFactory.createUser();

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([existingUser]),
                }),
            } as any);

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            const valuesFn = jest.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValueOnce({
                values: valuesFn,
            } as any);

            const done = jest.fn();

            // Act
            await strategy.validate(
                'test-access-token',
                'test-refresh-token',
                googleProfile,
                done
            );

            // Assert
            expect(valuesFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    accessToken: 'test-access-token',
                    refreshToken: 'test-refresh-token',
                })
            );
        });

        it('should set emailVerified to true for Google users', async () => {
            // Arrange
            const googleProfile = TestDataFactory.createGoogleProfile();

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            const newUser = TestDataFactory.createUser({ emailVerified: true });
            const userValuesFn = jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([newUser]),
            });
            mockDb.insert.mockReturnValueOnce({
                values: userValuesFn,
            } as any);

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            const done = jest.fn();

            // Act
            await strategy.validate(
                'access-token',
                'refresh-token',
                googleProfile,
                done
            );

            // Assert
            expect(userValuesFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    emailVerified: true,
                })
            );
        });
    });
});
