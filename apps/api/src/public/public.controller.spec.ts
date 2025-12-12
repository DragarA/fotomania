import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { TestDataFactory } from '../../test/utils/test-data.factory';
import { CataloguesService } from '../catalogues/catalogues.service';
import { ClientSessionsService } from '../client-sessions/client-sessions.service';
import { PhotosService } from '../photos/photos.service';

import { PublicController } from './public.controller';

describe('PublicController', () => {
    let controller: PublicController;
    let cataloguesService: jest.Mocked<CataloguesService>;
    let photosService: jest.Mocked<PhotosService>;

    beforeEach(async () => {
        const mockCataloguesService = {
            findPublicBySlug: jest.fn(),
        };

        const mockPhotosService = {
            findPublicBySlugAndCollection: jest.fn(),
        };

        const mockClientSessionsService = {
            addFavourites: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PublicController],
            providers: [
                {
                    provide: CataloguesService,
                    useValue: mockCataloguesService,
                },
                {
                    provide: PhotosService,
                    useValue: mockPhotosService,
                },
                {
                    provide: ClientSessionsService,
                    useValue: mockClientSessionsService,
                },
            ],
        }).compile();

        controller = module.get<PublicController>(PublicController);
        cataloguesService = module.get(CataloguesService);
        photosService = module.get(PhotosService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findBySlug', () => {
        it('should return public catalogue data by slug', async () => {
            const slug = 'wedding-2024';
            const mockCatalogue = TestDataFactory.createCatalogue({
                publicUrlSlug: slug,
                title: 'Wedding 2024',
            });
            const mockCollection = TestDataFactory.createCollection({
                name: 'Ceremony',
            });

            cataloguesService.findPublicBySlug.mockResolvedValue({
                catalogue: mockCatalogue,
                collections: [mockCollection],
            });

            const result = await controller.findBySlug(slug);

            expect(cataloguesService.findPublicBySlug).toHaveBeenCalledWith(
                slug
            );
            expect(result).toBeDefined();
            expect(result.title).toBe('Wedding 2024');
            expect(result.collections).toHaveLength(1);
            expect(result.collections![0]!.name).toBe('Ceremony');
        });

        it('should throw NotFoundException when catalogue not found', async () => {
            const slug = 'non-existent';

            cataloguesService.findPublicBySlug.mockRejectedValue(
                new NotFoundException(`Catalogue with slug ${slug} not found`)
            );

            await expect(controller.findBySlug(slug)).rejects.toThrow(
                NotFoundException
            );
            expect(cataloguesService.findPublicBySlug).toHaveBeenCalledWith(
                slug
            );
        });

        it('should return catalogue with multiple collections', async () => {
            const slug = 'summer-vacation';
            const mockCatalogue = TestDataFactory.createCatalogue({
                publicUrlSlug: slug,
            });
            const collections = [
                TestDataFactory.createCollection({ name: 'Beach' }),
                TestDataFactory.createCollection({ name: 'Mountains' }),
                TestDataFactory.createCollection({ name: 'City Tour' }),
            ];

            cataloguesService.findPublicBySlug.mockResolvedValue({
                catalogue: mockCatalogue,
                collections,
            });

            const result = await controller.findBySlug(slug);

            expect(result.collections).toHaveLength(3);
        });
    });

    describe('findCollectionPhotosBySlug', () => {
        it('should return photos for a public collection', async () => {
            const slug = 'wedding-2024';
            const collectionId = 'collection-123';
            const mockPhotos = [
                TestDataFactory.createPhoto({ originalFileName: 'photo1.jpg' }),
                TestDataFactory.createPhoto({ originalFileName: 'photo2.jpg' }),
                TestDataFactory.createPhoto({ originalFileName: 'photo3.jpg' }),
            ];

            photosService.findPublicBySlugAndCollection.mockResolvedValue(
                mockPhotos
            );

            const result = await controller.findCollectionPhotosBySlug(
                slug,
                collectionId
            );

            expect(
                photosService.findPublicBySlugAndCollection
            ).toHaveBeenCalledWith(slug, collectionId);
            expect(result).toHaveLength(3);
            expect(result[0]!.originalFileName).toBe('photo1.jpg');
            expect(result[1]!.originalFileName).toBe('photo2.jpg');
            expect(result[2]!.originalFileName).toBe('photo3.jpg');
        });

        it('should return empty array when collection has no photos', async () => {
            const slug = 'wedding-2024';
            const collectionId = 'empty-collection';

            photosService.findPublicBySlugAndCollection.mockResolvedValue([]);

            const result = await controller.findCollectionPhotosBySlug(
                slug,
                collectionId
            );

            expect(result).toEqual([]);
            expect(
                photosService.findPublicBySlugAndCollection
            ).toHaveBeenCalledWith(slug, collectionId);
        });

        it('should throw NotFoundException when collection not found', async () => {
            const slug = 'wedding-2024';
            const collectionId = 'non-existent';

            photosService.findPublicBySlugAndCollection.mockRejectedValue(
                new NotFoundException(
                    `Collection with ID ${collectionId} not found`
                )
            );

            await expect(
                controller.findCollectionPhotosBySlug(slug, collectionId)
            ).rejects.toThrow(NotFoundException);
        });

        it('should return photos with all required fields', async () => {
            const slug = 'wedding-2024';
            const collectionId = 'collection-123';
            const mockPhoto = TestDataFactory.createPhoto({
                id: 'photo-123',
                originalFileName: 'sunset.jpg',
                storagePath: 'uploads/wedding/sunset.jpg',
                thumbnailPath: 'uploads/wedding/thumbnails/sunset.jpg',
                mimeType: 'image/jpeg',
                width: 1920,
                height: 1080,
                size: 2048576,
            });

            photosService.findPublicBySlugAndCollection.mockResolvedValue([
                mockPhoto,
            ]);

            const result = await controller.findCollectionPhotosBySlug(
                slug,
                collectionId
            );

            expect(result).toHaveLength(1);
            expect(result[0]!.id).toBe('photo-123');
            expect(result[0]!.originalFileName).toBe('sunset.jpg');
            expect(result[0]!.storagePath).toBe('uploads/wedding/sunset.jpg');
        });
    });

    describe('addFavourites', () => {
        it('should add favourites successfully', async () => {
            const slug = 'wedding-2024';
            const body = {
                photoIds: ['photo-1', 'photo-2', 'photo-3'],
                email: 'test@email.com',
            };

            const result = await controller.addFavourites(slug, body);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
        });

        it('should handle empty photoIds array', async () => {
            const slug = 'wedding-2024';
            const body = {
                photoIds: [],
                email: 'test@email.com',
            };

            const result = await controller.addFavourites(slug, body);

            expect(result.success).toBe(true);
        });

        it('should handle single photo favourite', async () => {
            const slug = 'wedding-2024';
            const body = {
                photoIds: ['photo-1'],
                email: 'test@email.com',
            };

            const result = await controller.addFavourites(slug, body);

            expect(result.success).toBe(true);
        });
    });
});
