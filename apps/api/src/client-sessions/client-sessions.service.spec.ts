import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';

import {
    createDrizzleMock,
    MockDrizzleDB,
    resetDrizzleMock,
} from '../../test/utils/drizzle-mock.factory';
import { TestDataFactory } from '../../test/utils/test-data.factory';
import { DRIZZLE } from '../common/db/drizzle';
import { EmailService } from '../common/email/email.service';

import { ClientSessionsService } from './client-sessions.service';

describe('ClientSessionsService', () => {
    let service: ClientSessionsService;
    let mockDb: MockDrizzleDB;
    let mockEmailService: jest.Mocked<EmailService>;
    let mockConfigService: jest.Mocked<ConfigService>;
    let mockI18nService: jest.Mocked<I18nService>;

    beforeEach(async () => {
        mockDb = createDrizzleMock();
        mockEmailService = {
            send: jest.fn(),
        } as any;
        mockConfigService = {
            get: jest.fn().mockReturnValue('http://localhost:5173'),
        } as any;
        mockI18nService = {
            t: jest.fn().mockImplementation((key: string) => {
                if (key === 'emails.favourites_submitted.photo_singular') {
                    return 'photo';
                }
                if (key === 'emails.favourites_submitted.photo_plural') {
                    return 'photos';
                }
                return key;
            }),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientSessionsService,
                {
                    provide: DRIZZLE,
                    useValue: mockDb,
                },
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: I18nService,
                    useValue: mockI18nService,
                },
            ],
        }).compile();

        service = module.get<ClientSessionsService>(ClientSessionsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        resetDrizzleMock(mockDb);
    });

    describe('addFavourites', () => {
        const slug = 'test-catalogue';
        const email = 'client@example.com';
        const photoIds = ['test-photo-id-1', 'test-photo-id-2'];

        it('should create new session with client info when no existing session', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue({
                publicUrlSlug: slug,
            });
            const testUser = TestDataFactory.createUser({
                email: 'owner@example.com',
            });
            const clientInfo = {
                clientName: 'John Doe',
                clientAddressStreet: '123 Main St',
                clientAddressCity: 'Ljubljana',
                clientAddressPostalCode: '1000',
                clientAddressCountry: 'Slovenia',
                clientPhoneNumber: '+386 40 123 456',
                clientNotes: 'Some notes',
            };

            // Mock catalogue lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([
                            {
                                id: testCatalogue.id,
                                title: testCatalogue.title,
                                ownerEmail: testUser.email,
                                ownerPreferredLanguage: testUser.preferredLanguage,
                            },
                        ]),
                    }),
                }),
            } as any);

            // Mock photo count validation
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            groupBy: jest.fn().mockResolvedValue([
                                { photoCount: photoIds.length },
                            ]),
                        }),
                    }),
                }),
            } as any);

            // Mock existing session lookup (none found)
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([]),
                    }),
                }),
            } as any);

            // Mock session insert
            const newSession = TestDataFactory.createClientSession({
                email,
                catalogueId: testCatalogue.id,
                ...clientInfo,
            });
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([newSession]),
                }),
            } as any);

            // Mock delete favourites
            mockDb.delete.mockReturnValueOnce({
                where: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Mock insert favourites
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Act
            const result = await service.addFavourites(
                slug,
                email,
                photoIds,
                clientInfo
            );

            // Assert
            expect(result).toBeDefined();
            expect(result.email).toBe(email);
            expect(result.clientName).toBe(clientInfo.clientName);
            expect(result.clientAddressStreet).toBe(
                clientInfo.clientAddressStreet
            );
            expect(result.clientAddressCity).toBe(clientInfo.clientAddressCity);
            expect(result.clientAddressPostalCode).toBe(
                clientInfo.clientAddressPostalCode
            );
            expect(result.clientAddressCountry).toBe(
                clientInfo.clientAddressCountry
            );
            expect(result.clientPhoneNumber).toBe(
                clientInfo.clientPhoneNumber
            );
            expect(result.clientNotes).toBe(clientInfo.clientNotes);
            expect(mockEmailService.send).toHaveBeenCalled();
        });

        it('should create new session with null client info fields when not provided', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue({
                publicUrlSlug: slug,
            });
            const testUser = TestDataFactory.createUser({
                email: 'owner@example.com',
            });

            // Mock catalogue lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([
                            {
                                id: testCatalogue.id,
                                title: testCatalogue.title,
                                ownerEmail: testUser.email,
                                ownerPreferredLanguage: testUser.preferredLanguage,
                            },
                        ]),
                    }),
                }),
            } as any);

            // Mock photo count validation
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            groupBy: jest.fn().mockResolvedValue([
                                { photoCount: photoIds.length },
                            ]),
                        }),
                    }),
                }),
            } as any);

            // Mock existing session lookup (none found)
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([]),
                    }),
                }),
            } as any);

            // Mock session insert
            const newSession = TestDataFactory.createClientSession({
                email,
                catalogueId: testCatalogue.id,
            });
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([newSession]),
                }),
            } as any);

            // Mock delete favourites
            mockDb.delete.mockReturnValueOnce({
                where: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Mock insert favourites
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Act
            const result = await service.addFavourites(slug, email, photoIds);

            // Assert
            expect(result).toBeDefined();
            expect(result.email).toBe(email);
            expect(result.clientName).toBeNull();
            expect(result.clientAddressStreet).toBeNull();
            expect(result.clientAddressCity).toBeNull();
            expect(result.clientAddressPostalCode).toBeNull();
            expect(result.clientAddressCountry).toBeNull();
            expect(result.clientPhoneNumber).toBeNull();
            expect(result.clientNotes).toBeNull();
            expect(mockEmailService.send).toHaveBeenCalled();
        });

        it('should update existing session with new client info', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue({
                publicUrlSlug: slug,
            });
            const testUser = TestDataFactory.createUser({
                email: 'owner@example.com',
            });
            const existingSession = TestDataFactory.createClientSession({
                email,
                catalogueId: testCatalogue.id,
                clientName: 'Old Name',
            });
            const newClientInfo = {
                clientName: 'New Name',
                clientPhoneNumber: '+386 40 999 999',
            };

            // Mock catalogue lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([
                            {
                                id: testCatalogue.id,
                                title: testCatalogue.title,
                                ownerEmail: testUser.email,
                                ownerPreferredLanguage: testUser.preferredLanguage,
                            },
                        ]),
                    }),
                }),
            } as any);

            // Mock photo count validation
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            groupBy: jest.fn().mockResolvedValue([
                                { photoCount: photoIds.length },
                            ]),
                        }),
                    }),
                }),
            } as any);

            // Mock existing session lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([existingSession]),
                    }),
                }),
            } as any);

            // Mock session update
            const updatedSession = {
                ...existingSession,
                ...newClientInfo,
            };
            mockDb.update.mockReturnValueOnce({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedSession]),
                    }),
                }),
            } as any);

            // Mock delete favourites
            mockDb.delete.mockReturnValueOnce({
                where: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Mock insert favourites
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Act
            const result = await service.addFavourites(
                slug,
                email,
                photoIds,
                newClientInfo
            );

            // Assert
            expect(result).toBeDefined();
            expect(result.clientName).toBe(newClientInfo.clientName);
            expect(result.clientPhoneNumber).toBe(
                newClientInfo.clientPhoneNumber
            );
            expect(mockEmailService.send).toHaveBeenCalled();
        });

        it('should preserve existing client info when not provided in update', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue({
                publicUrlSlug: slug,
            });
            const testUser = TestDataFactory.createUser({
                email: 'owner@example.com',
            });
            const existingSession = TestDataFactory.createClientSession({
                email,
                catalogueId: testCatalogue.id,
                clientName: 'Existing Name',
                clientPhoneNumber: '+386 40 111 111',
                clientNotes: 'Existing notes',
            });

            // Mock catalogue lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([
                            {
                                id: testCatalogue.id,
                                title: testCatalogue.title,
                                ownerEmail: testUser.email,
                                ownerPreferredLanguage: testUser.preferredLanguage,
                            },
                        ]),
                    }),
                }),
            } as any);

            // Mock photo count validation
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            groupBy: jest.fn().mockResolvedValue([
                                { photoCount: photoIds.length },
                            ]),
                        }),
                    }),
                }),
            } as any);

            // Mock existing session lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([existingSession]),
                    }),
                }),
            } as any);

            // Mock session update
            mockDb.update.mockReturnValueOnce({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([existingSession]),
                    }),
                }),
            } as any);

            // Mock delete favourites
            mockDb.delete.mockReturnValueOnce({
                where: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Mock insert favourites
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Act
            const result = await service.addFavourites(slug, email, photoIds);

            // Assert
            expect(result).toBeDefined();
            expect(result.clientName).toBe(existingSession.clientName);
            expect(result.clientPhoneNumber).toBe(
                existingSession.clientPhoneNumber
            );
            expect(result.clientNotes).toBe(existingSession.clientNotes);
        });

        it('should throw NotFoundException when catalogue not found', async () => {
            // Arrange
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([]),
                    }),
                }),
            } as any);

            // Act & Assert
            await expect(
                service.addFavourites(slug, email, photoIds)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when photo IDs do not match catalogue', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue({
                publicUrlSlug: slug,
            });
            const testUser = TestDataFactory.createUser({
                email: 'owner@example.com',
            });

            // Mock catalogue lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([
                            {
                                id: testCatalogue.id,
                                title: testCatalogue.title,
                                ownerEmail: testUser.email,
                                ownerPreferredLanguage: testUser.preferredLanguage,
                            },
                        ]),
                    }),
                }),
            } as any);

            // Mock photo count validation (mismatched count)
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            groupBy: jest
                                .fn()
                                .mockResolvedValue([{ photoCount: 1 }]),
                        }),
                    }),
                }),
            } as any);

            // Act & Assert
            await expect(
                service.addFavourites(slug, email, photoIds)
            ).rejects.toThrow(BadRequestException);
        });

        it('should send email notification with correct language', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue({
                publicUrlSlug: slug,
            });
            const testUser = TestDataFactory.createUser({
                email: 'owner@example.com',
                preferredLanguage: 'sl',
            });

            // Mock catalogue lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([
                            {
                                id: testCatalogue.id,
                                title: testCatalogue.title,
                                ownerEmail: testUser.email,
                                ownerPreferredLanguage: testUser.preferredLanguage,
                            },
                        ]),
                    }),
                }),
            } as any);

            // Mock photo count validation
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            groupBy: jest.fn().mockResolvedValue([
                                { photoCount: photoIds.length },
                            ]),
                        }),
                    }),
                }),
            } as any);

            // Mock existing session lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([]),
                    }),
                }),
            } as any);

            // Mock session insert
            const newSession = TestDataFactory.createClientSession({
                email,
                catalogueId: testCatalogue.id,
            });
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([newSession]),
                }),
            } as any);

            // Mock delete favourites
            mockDb.delete.mockReturnValueOnce({
                where: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Mock insert favourites
            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Act
            await service.addFavourites(slug, email, photoIds);

            // Assert
            expect(mockEmailService.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: testUser.email,
                    language: 'sl',
                })
            );
            expect(mockI18nService.t).toHaveBeenCalledWith(
                expect.any(String),
                { lang: 'sl' }
            );
        });
    });

    describe('getFavouritesBySession', () => {
        it('should return session with client info and photos', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue();
            const testSession = TestDataFactory.createClientSession({
                catalogueId: testCatalogue.id,
                clientName: 'John Doe',
                clientPhoneNumber: '+386 40 123 456',
            });
            const testPhotos = TestDataFactory.createPhotos(2);

            // Mock catalogue lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([testCatalogue]),
                }),
            } as any);

            // Mock session lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([testSession]),
                    }),
                }),
            } as any);

            // Mock photos lookup
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue(testPhotos),
                    }),
                }),
            } as any);

            // Act
            const result = await service.getFavouritesBySession(
                testSession.id,
                testCatalogue.id,
                testCatalogue.ownerId
            );

            // Assert
            expect(result).toBeDefined();
            expect(result.sessionId).toBe(testSession.id);
            expect(result.email).toBe(testSession.email);
            expect(result.clientName).toBe(testSession.clientName);
            expect(result.clientPhoneNumber).toBe(testSession.clientPhoneNumber);
            expect(result.photos).toEqual(testPhotos);
        });

        it('should throw NotFoundException when catalogue not found', async () => {
            // Arrange
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            // Act & Assert
            await expect(
                service.getFavouritesBySession(
                    'session-id',
                    'catalogue-id',
                    'owner-id'
                )
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when owner does not match', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue({
                ownerId: 'owner-1',
            });

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([testCatalogue]),
                }),
            } as any);

            // Act & Assert
            await expect(
                service.getFavouritesBySession(
                    'session-id',
                    testCatalogue.id,
                    'different-owner'
                )
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when session not found', async () => {
            // Arrange
            const testCatalogue = TestDataFactory.createCatalogue();

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([testCatalogue]),
                }),
            } as any);

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([]),
                    }),
                }),
            } as any);

            // Act & Assert
            await expect(
                service.getFavouritesBySession(
                    'nonexistent-session',
                    testCatalogue.id,
                    testCatalogue.ownerId
                )
            ).rejects.toThrow(NotFoundException);
        });
    });
});
