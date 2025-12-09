import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { DRIZZLE } from '../common/db/drizzle';
import {
  createDrizzleMock,
  MockDrizzleDB,
  resetDrizzleMock,
} from '../../test/utils/drizzle-mock.factory';
import { TestDataFactory } from '../../test/utils/test-data.factory';
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

  describe('create', () => {
    it('should create a new photo successfully', async () => {
      const createDto = {
        originalFileName: 'wedding-001.jpg',
        storagePath: '/uploads/test/wedding-001.jpg',
        mimeType: 'image/jpeg',
        thumbnailPath: '/uploads/test/thumbnails/wedding-001.jpg',
        width: 1920,
        height: 1080,
        size: 2048576,
        collectionId: 'collection-123',
      };
      const ownerId = 'user-123';

      // Mock collection and catalogue check
      const mockCollection = TestDataFactory.createCollection({
        id: 'collection-123',
      });
      const mockCatalogue = TestDataFactory.createCatalogue({
        ownerId: 'user-123',
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              { collection: mockCollection, catalogue: mockCatalogue },
            ]),
          }),
        }),
      } as any);

      // Mock insert
      const mockPhoto = TestDataFactory.createPhoto({
        id: 'photo-123',
        ...createDto,
      });

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockPhoto]),
        }),
      } as any);

      const result = await service.create(createDto, ownerId);

      expect(result).toBeDefined();
      expect(result!.originalFileName).toBe(createDto.originalFileName);
      expect(result!.collectionId).toBe(createDto.collectionId);
    });

    it('should throw NotFoundException when collection not found', async () => {
      const createDto = {
        originalFileName: 'wedding-001.jpg',
        storagePath: '/uploads/test/wedding-001.jpg',
        mimeType: 'image/jpeg',
        collectionId: 'non-existent',
      };
      const ownerId = 'user-123';

      // Mock collection check (not found)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await expect(service.create(createDto, ownerId)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user does not own collection', async () => {
      const createDto = {
        originalFileName: 'wedding-001.jpg',
        storagePath: '/uploads/test/wedding-001.jpg',
        mimeType: 'image/jpeg',
        collectionId: 'collection-123',
      };
      const ownerId = 'user-123';
      const differentOwnerId = 'user-456';

      // Mock collection check (different owner)
      const mockCollection = TestDataFactory.createCollection({
        id: 'collection-123',
      });
      const mockCatalogue = TestDataFactory.createCatalogue({
        ownerId: differentOwnerId,
      });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([
              { collection: mockCollection, catalogue: mockCatalogue },
            ]),
          }),
        }),
      } as any);

      await expect(service.create(createDto, ownerId)).rejects.toThrow(
        ForbiddenException
      );
    });
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
            where: jest.fn().mockResolvedValue([
              { collection: mockCollection, catalogue: mockCatalogue },
            ]),
          }),
        }),
      } as any);

      // Mock photos query
      const mockPhotos = TestDataFactory.createPhotos(2, { collectionId });

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

      await expect(service.findAll(collectionId, ownerId)).rejects.toThrow(
        NotFoundException
      );
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
            where: jest.fn().mockResolvedValue([
              { collection: mockCollection, catalogue: mockCatalogue },
            ]),
          }),
        }),
      } as any);

      await expect(service.findAll(collectionId, ownerId)).rejects.toThrow(
        ForbiddenException
      );
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
              where: jest.fn().mockResolvedValue([
                { photo: mockPhoto, catalogue: mockCatalogue },
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

  describe('update', () => {
    it('should update a photo successfully', async () => {
      const photoId = 'photo-123';
      const ownerId = 'user-123';
      const updateDto = { originalFileName: 'updated-photo.jpg' };
      const existingPhoto = TestDataFactory.createPhoto({
        id: photoId,
        originalFileName: 'old-photo.jpg',
      });

      // Mock findOne
      const mockCatalogue = TestDataFactory.createCatalogue({ ownerId });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                { photo: existingPhoto, catalogue: mockCatalogue },
              ]),
            }),
          }),
        }),
      } as any);

      // Mock update
      const updatedPhoto = { ...existingPhoto, ...updateDto };
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedPhoto]),
          }),
        }),
      } as any);

      const result = await service.update(photoId, updateDto, ownerId);

      expect(result).toBeDefined();
      expect(result!.originalFileName).toBe(updateDto.originalFileName);
    });
  });

  describe('remove', () => {
    it('should delete a photo successfully', async () => {
      const photoId = 'photo-123';
      const ownerId = 'user-123';

      const mockPhoto = TestDataFactory.createPhoto({ id: photoId });
      const mockCatalogue = TestDataFactory.createCatalogue({ ownerId });
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([
                { photo: mockPhoto, catalogue: mockCatalogue },
              ]),
            }),
          }),
        }),
      } as any);

      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      const result = await service.remove(photoId, ownerId);

      expect(result.message).toBe('Photo deleted successfully');
    });
  });
});
