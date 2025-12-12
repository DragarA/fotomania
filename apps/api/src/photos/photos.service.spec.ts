import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
    createDrizzleMock,
    MockDrizzleDB,
    resetDrizzleMock,
} from '../../test/utils/drizzle-mock.factory';
import { TestDataFactory } from '../../test/utils/test-data.factory';
import { DRIZZLE } from '../common/db/drizzle';

import { PhotosService } from './photos.service';

describe('PhotosService', () => {
    let service: PhotosService;
    let mockDb: MockDrizzleDB;

    beforeEach(async () => {
        mockDb = createDrizzleMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PhotosService,
                {
                    provide: DRIZZLE,
                    useValue: mockDb,
                },
            ],
        }).compile();

        service = module.get<PhotosService>(PhotosService);
    });

    afterEach(() => {
        resetDrizzleMock(mockDb);
    });

    describe('findAll', () => {
        it('should return all photos for a collection', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';

            // Mock collection check
            const mockCollection = TestDataFactory.createCollection({
                id: collectionId,
            });
            const mockCatalogue = TestDataFactory.createCatalogue({ ownerId });
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest
                            .fn()
                            .mockResolvedValue([
                                {
                                    collection: mockCollection,
                                    catalogue: mockCatalogue,
                                },
                            ]),
                    }),
                }),
            } as any);

            // Mock photos query
            const mockPhotos = TestDataFactory.createPhotos(2, {
                collectionId,
            });

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        orderBy: jest.fn().mockResolvedValue(mockPhotos),
                    }),
                }),
            } as any);

            const result = await service.findAll(collectionId, ownerId);

            expect(result).toHaveLength(2);
        });

        it('should throw NotFoundException when collection not found', async () => {
            const collectionId = 'non-existent';
            const ownerId = 'user-123';

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([]),
                    }),
                }),
            } as any);

            await expect(
                service.findAll(collectionId, ownerId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user does not own collection', async () => {
            const collectionId = 'collection-123';
            const ownerId = 'user-123';
            const differentOwnerId = 'user-456';

            const mockCollection = TestDataFactory.createCollection({
                id: collectionId,
            });
            const mockCatalogue = TestDataFactory.createCatalogue({
                ownerId: differentOwnerId,
            });
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest
                            .fn()
                            .mockResolvedValue([
                                {
                                    collection: mockCollection,
                                    catalogue: mockCatalogue,
                                },
                            ]),
                    }),
                }),
            } as any);

            await expect(
                service.findAll(collectionId, ownerId)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('findOne', () => {
        it('should return a photo by ID', async () => {
            const photoId = 'photo-123';
            const ownerId = 'user-123';
            const mockPhoto = TestDataFactory.createPhoto({ id: photoId });
            const mockCatalogue = TestDataFactory.createCatalogue({ ownerId });

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        innerJoin: jest.fn().mockReturnValue({
                            where: jest
                                .fn()
                                .mockResolvedValue([
                                    {
                                        photo: mockPhoto,
                                        catalogue: mockCatalogue,
                                    },
                                ]),
                        }),
                    }),
                }),
            } as any);

            const result = await service.findOne(photoId, ownerId);

            expect(result).toEqual(mockPhoto);
        });

        it('should throw NotFoundException when photo not found', async () => {
            const photoId = 'non-existent';
            const ownerId = 'user-123';

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        innerJoin: jest.fn().mockReturnValue({
                            where: jest.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            } as any);

            await expect(service.findOne(photoId, ownerId)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('remove', () => {
        it('should delete a photo successfully', async () => {
            const photoId = 'photo-123';
            const ownerId = 'user-123';

            const mockPhoto = TestDataFactory.createPhoto({
                id: photoId,
                storagePath: 'test/photo.jpg',
                thumbnailPath: 'test/thumb.jpg',
            });
            const mockCatalogue = TestDataFactory.createCatalogue({ ownerId });

            // Mock findOne (first select call)
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        innerJoin: jest.fn().mockReturnValue({
                            where: jest
                                .fn()
                                .mockResolvedValue([
                                    {
                                        photo: mockPhoto,
                                        catalogue: mockCatalogue,
                                    },
                                ]),
                        }),
                    }),
                }),
            } as any);

            // Mock catalogue cover check (second select call)
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([]),
                    }),
                }),
            } as any);

            // Mock delete
            mockDb.delete.mockReturnValueOnce({
                where: jest.fn().mockResolvedValue(undefined),
            } as any);

            // Mock fs operations
            const unlinkSyncSpy = jest
                .spyOn(require('fs'), 'unlinkSync')
                .mockImplementation();
            const readdirSyncSpy = jest
                .spyOn(require('fs'), 'readdirSync')
                .mockReturnValue(['other-file.jpg']);
            const rmdirSyncSpy = jest
                .spyOn(require('fs'), 'rmdirSync')
                .mockImplementation();

            const result = await service.remove(photoId, ownerId);

            expect(result.message).toBe('Photo deleted successfully');

            // Cleanup spies
            unlinkSyncSpy.mockRestore();
            readdirSyncSpy.mockRestore();
            rmdirSyncSpy.mockRestore();
        });
    });
});
