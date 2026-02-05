import { promises as fsPromises } from 'fs';

import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import {
    createDrizzleMock,
    MockDrizzleDB,
    resetDrizzleMock,
} from '../../test/utils/drizzle-mock.factory';
import { DRIZZLE } from '../common/db/drizzle';
import { EmailService } from '../common/email/email.service';
import { PhotosService } from '../photos/photos.service';

import { CollectionsService } from './collections.service';

describe('CollectionsService', () => {
    let service: CollectionsService;
    let mockDb: MockDrizzleDB;

    beforeEach(async () => {
        mockDb = createDrizzleMock();

        const mockPhotosServiceValue = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findPublicBySlugAndCollection: jest.fn(),
            removeAllForCollection: jest.fn(),
        };

        const mockEmailService = {
            send: jest.fn().mockResolvedValue(undefined),
        };

        const mockConfigService = {
            getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
            get: jest.fn().mockReturnValue('http://localhost:5173'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CollectionsService,
                {
                    provide: DRIZZLE,
                    useValue: mockDb,
                },
                {
                    provide: PhotosService,
                    useValue: mockPhotosServiceValue,
                },
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<CollectionsService>(CollectionsService);
    });

    afterEach(() => {
        resetDrizzleMock(mockDb);
    });

    describe('create', () => {
        it('should create a new collection successfully', async () => {
            const createDto = {
                name: 'Ceremony Photos',
                catalogueId: 'catalogue-123',
            };
            const ownerId = 'user-123';

            // Mock catalogue check
            const mockCatalogue = {
                id: 'catalogue-123',
                ownerId: 'user-123',
            };
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockCatalogue]),
                }),
            } as any);

            // Mock insert
            const mockCollection = {
                id: 'collection-123',
                ...createDto,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDb.insert.mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockCollection]),
                }),
            } as any);

            const result = await service.create(createDto, ownerId);

            expect(result).toBeDefined();
            expect(result!.name).toBe(createDto.name);
            expect(result!.catalogueId).toBe(createDto.catalogueId);
        });

        it('should throw NotFoundException when catalogue not found', async () => {
            const createDto = {
                name: 'Test Collection',
                catalogueId: 'non-existent',
            };
            const ownerId = 'user-123';

            // Mock catalogue check (not found)
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            await expect(service.create(createDto, ownerId)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw ForbiddenException when user does not own catalogue', async () => {
            const createDto = {
                name: 'Test Collection',
                catalogueId: 'catalogue-123',
            };
            const ownerId = 'user-123';
            const differentOwnerId = 'user-456';

            // Mock catalogue check (different owner)
            const mockCatalogue = {
                id: 'catalogue-123',
                ownerId: differentOwnerId,
            };
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockCatalogue]),
                }),
            } as any);

            await expect(service.create(createDto, ownerId)).rejects.toThrow(
                ForbiddenException
            );
        });
    });

    describe('findAll', () => {
        it('should return all collections for a catalogue', async () => {
            const catalogueId = 'catalogue-123';
            const ownerId = 'user-123';

            // Mock catalogue check
            const mockCatalogue = {
                id: catalogueId,
                ownerId,
            };
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockCatalogue]),
                }),
            } as any);

            // Mock collections query with photo count
            const mockCollections = [
                {
                    collection: { id: '1', name: 'Col 1', catalogueId },
                    photoCount: 5,
                },
                {
                    collection: { id: '2', name: 'Col 2', catalogueId },
                    photoCount: 10,
                },
            ];

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        leftJoin: jest.fn().mockReturnValue({
                            where: jest.fn().mockReturnValue({
                                groupBy: jest
                                    .fn()
                                    .mockResolvedValue(mockCollections),
                            }),
                        }),
                    }),
                }),
            } as any);

            const result = await service.findAll(catalogueId, ownerId);

            expect(result).toHaveLength(2);
            expect(result[0]!.photoCount).toBe(5);
            expect(result[1]!.photoCount).toBe(10);
        });

        it('should throw NotFoundException when catalogue not found', async () => {
            const catalogueId = 'non-existent';
            const ownerId = 'user-123';

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            await expect(service.findAll(catalogueId, ownerId)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw ForbiddenException when user does not own catalogue', async () => {
            const catalogueId = 'catalogue-123';
            const ownerId = 'user-123';
            const differentOwnerId = 'user-456';

            const mockCatalogue = {
                id: catalogueId,
                ownerId: differentOwnerId,
            };
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockCatalogue]),
                }),
            } as any);

            await expect(service.findAll(catalogueId, ownerId)).rejects.toThrow(
                ForbiddenException
            );
        });
    });

    describe('findOne', () => {
        it('should return a collection by ID', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';
            const mockResult = {
                collection: {
                    id: collectionId,
                    name: 'Test',
                    catalogueId: 'cat-1',
                },
                photoCount: 15,
            };

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        leftJoin: jest.fn().mockReturnValue({
                            leftJoin: jest.fn().mockReturnValue({
                                where: jest.fn().mockReturnValue({
                                    groupBy: jest
                                        .fn()
                                        .mockResolvedValue([mockResult]),
                                }),
                            }),
                        }),
                    }),
                }),
            } as any);

            const result = await service.findOne(collectionId, ownerId);

            expect(result).toEqual(mockResult);
        });

        it('should throw NotFoundException when collection not found', async () => {
            const collectionId = 'non-existent';
            const ownerId = 'user-123';

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

            await expect(
                service.findOne(collectionId, ownerId)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a collection successfully', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';
            const updateDto = { name: 'Updated Name' };
            const existingCollection = {
                collection: {
                    id: collectionId,
                    name: 'Old Name',
                    catalogueId: 'cat-1',
                },
                photoCount: 5,
            };

            // Mock findOne
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        leftJoin: jest.fn().mockReturnValue({
                            leftJoin: jest.fn().mockReturnValue({
                                where: jest.fn().mockReturnValue({
                                    groupBy: jest
                                        .fn()
                                        .mockResolvedValue([
                                            existingCollection,
                                        ]),
                                }),
                            }),
                        }),
                    }),
                }),
            } as any);

            // Mock update
            const updatedCollection = {
                ...existingCollection.collection,
                ...updateDto,
            };
            mockDb.update.mockReturnValueOnce({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest
                            .fn()
                            .mockResolvedValue([updatedCollection]),
                    }),
                }),
            } as any);

            const result = await service.update(
                collectionId,
                updateDto,
                ownerId
            );

            expect(result).toBeDefined();
            expect(result!.name).toBe(updateDto.name);
        });
    });

    describe('remove', () => {
        it('should delete a collection successfully', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';

            // Mock findOne
            const existingCollection = {
                collection: {
                    id: collectionId,
                    name: 'Test',
                    catalogueId: 'cat-1',
                },
                photoCount: 5,
            };
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        leftJoin: jest.fn().mockReturnValue({
                            leftJoin: jest.fn().mockReturnValue({
                                where: jest.fn().mockReturnValue({
                                    groupBy: jest
                                        .fn()
                                        .mockResolvedValue([
                                            existingCollection,
                                        ]),
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

            // Mock fs operations
            const rmdirSyncSpy = jest
                .spyOn(require('fs'), 'rmdirSync')
                .mockImplementation();

            const result = await service.remove(collectionId, ownerId);

            expect(result.message).toBe('Collection deleted successfully');

            // Cleanup spy
            rmdirSyncSpy.mockRestore();
        });
    });

    describe('uploadInvoice', () => {
        const mockFindOneDelivery = () => {
            const existingCollection = {
                collection: {
                    id: 'collection-123',
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
                                    groupBy: jest
                                        .fn()
                                        .mockResolvedValue([
                                            existingCollection,
                                        ]),
                                }),
                            }),
                        }),
                    }),
                }),
            } as any);
            return existingCollection;
        };

        it('should upload invoice successfully', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';
            const mockFile = {
                buffer: Buffer.from('fake pdf content'),
                mimetype: 'application/pdf',
            } as Express.Multer.File;

            mockFindOneDelivery();

            // Mock fs operations
            const mkdirSpy = jest
                .spyOn(fsPromises, 'mkdir')
                .mockResolvedValue(undefined);
            const writeFileSpy = jest
                .spyOn(fsPromises, 'writeFile')
                .mockResolvedValue(undefined);

            // Mock update
            mockDb.update.mockReturnValueOnce({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(undefined),
                }),
            } as any);

            const result = await service.uploadInvoice(
                mockFile,
                collectionId,
                ownerId
            );

            expect(result.message).toBe('Invoice uploaded successfully');
            expect(result.hasInvoice).toBe(true);
            expect(mkdirSpy).toHaveBeenCalled();
            expect(writeFileSpy).toHaveBeenCalled();

            mkdirSpy.mockRestore();
            writeFileSpy.mockRestore();
        });

        it('should throw NotFoundException when collection not found', async () => {
            const collectionId = 'non-existent';
            const ownerId = 'user-123';
            const mockFile = {
                buffer: Buffer.from('fake pdf content'),
            } as Express.Multer.File;

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

            await expect(
                service.uploadInvoice(mockFile, collectionId, ownerId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when not a delivery collection', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';
            const mockFile = {
                buffer: Buffer.from('fake pdf content'),
            } as Express.Multer.File;

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
                                    groupBy: jest
                                        .fn()
                                        .mockResolvedValue([
                                            existingCollection,
                                        ]),
                                }),
                            }),
                        }),
                    }),
                }),
            } as any);

            await expect(
                service.uploadInvoice(mockFile, collectionId, ownerId)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('removeInvoice', () => {
        it('should remove invoice successfully', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';

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
                                    groupBy: jest
                                        .fn()
                                        .mockResolvedValue([
                                            existingCollection,
                                        ]),
                                }),
                            }),
                        }),
                    }),
                }),
            } as any);

            // Mock fs unlink
            const unlinkSpy = jest
                .spyOn(fsPromises, 'unlink')
                .mockResolvedValue(undefined);

            // Mock update
            mockDb.update.mockReturnValueOnce({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(undefined),
                }),
            } as any);

            const result = await service.removeInvoice(collectionId, ownerId);

            expect(result.message).toBe('Invoice removed successfully');
            expect(result.hasInvoice).toBe(false);
            expect(unlinkSpy).toHaveBeenCalled();

            unlinkSpy.mockRestore();
        });

        it('should throw NotFoundException when no invoice exists', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';

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
                                    groupBy: jest
                                        .fn()
                                        .mockResolvedValue([
                                            existingCollection,
                                        ]),
                                }),
                            }),
                        }),
                    }),
                }),
            } as any);

            await expect(
                service.removeInvoice(collectionId, ownerId)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('sendDeliveryEmail with invoice', () => {
        it('should send email with invoice attachment when invoice exists', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';

            // Mock query for delivery collection
            const mockResult = {
                collection: {
                    id: collectionId,
                    type: 'delivery',
                    deliverySlug: 'abc123',
                    invoicePath: 'invoices/collection-123/invoice.pdf',
                },
                clientEmail: 'client@example.com',
                catalogueTitle: 'Wedding 2024',
                photographerName: 'John Doe',
                photographerLanguage: 'en',
            };
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        innerJoin: jest.fn().mockReturnValue({
                            leftJoin: jest.fn().mockReturnValue({
                                where: jest
                                    .fn()
                                    .mockResolvedValue([mockResult]),
                            }),
                        }),
                    }),
                }),
            } as any);

            // Mock fs readFile
            const readFileSpy = jest
                .spyOn(fsPromises, 'readFile')
                .mockResolvedValue(Buffer.from('fake pdf content'));

            const result = await service.sendDeliveryEmail(
                collectionId,
                ownerId
            );

            expect(result.message).toBe('Delivery email sent successfully');
            expect(readFileSpy).toHaveBeenCalled();

            readFileSpy.mockRestore();
        });

        it('should send email without attachment when no invoice', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';

            // Mock query for delivery collection without invoice
            const mockResult = {
                collection: {
                    id: collectionId,
                    type: 'delivery',
                    deliverySlug: 'abc123',
                    invoicePath: null,
                },
                clientEmail: 'client@example.com',
                catalogueTitle: 'Wedding 2024',
                photographerName: 'John Doe',
                photographerLanguage: 'en',
            };
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        innerJoin: jest.fn().mockReturnValue({
                            leftJoin: jest.fn().mockReturnValue({
                                where: jest
                                    .fn()
                                    .mockResolvedValue([mockResult]),
                            }),
                        }),
                    }),
                }),
            } as any);

            const readFileSpy = jest.spyOn(fsPromises, 'readFile');

            const result = await service.sendDeliveryEmail(
                collectionId,
                ownerId
            );

            expect(result.message).toBe('Delivery email sent successfully');
            expect(readFileSpy).not.toHaveBeenCalled();

            readFileSpy.mockRestore();
        });
    });
});
