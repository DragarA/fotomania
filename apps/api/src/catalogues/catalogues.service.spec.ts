import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CataloguesService } from './catalogues.service';
import { DRIZZLE } from '../common/db/drizzle';
import {
  createDrizzleMock,
  MockDrizzleDB,
  resetDrizzleMock,
} from '../../test/utils/drizzle-mock.factory';

describe('CataloguesService', () => {
  let service: CataloguesService;
  let mockDb: MockDrizzleDB;

  beforeEach(async () => {
    mockDb = createDrizzleMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CataloguesService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<CataloguesService>(CataloguesService);
  });

  afterEach(() => {
    resetDrizzleMock(mockDb);
  });

  describe('create', () => {
    it('should create a new catalogue successfully', async () => {
      const createDto = {
        title: 'Test Catalogue',
        description: 'Test Description',
      };
      const ownerId = 'user-123';

      // Mock insert
      const mockCatalogue = {
        id: 'catalogue-123',
        ...createDto,
        publicUrlSlug: 'auto-generated-uuid',
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      const result = await service.create(createDto, ownerId);

      expect(result).toBeDefined();
      expect(result!.title).toBe(createDto.title);
      expect(result!.ownerId).toBe(ownerId);
      expect(result!.publicUrlSlug).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all catalogues for a specific owner', async () => {
      const ownerId = 'user-123';
      const mockCatalogues = [
        { catalogue: { id: '1', title: 'Cat 1', ownerId }, photoCount: 5 },
        { catalogue: { id: '2', title: 'Cat 2', ownerId }, photoCount: 10 },
      ];

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue(mockCatalogues),
              }),
            }),
          }),
        }),
      } as any);

      const result = await service.findAll(ownerId);

      expect(result).toHaveLength(2);
      expect(result[0]!.photoCount).toBe(5);
      expect(result[1]!.photoCount).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a catalogue by ID', async () => {
      const catalogueId = 'catalogue-123';
      const ownerId = 'user-123';
      const mockCatalogue = { id: catalogueId, title: 'Test', ownerId };

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      const result = await service.findOne(catalogueId, ownerId);

      expect(result).toEqual(mockCatalogue);
    });

    it('should throw NotFoundException when catalogue not found', async () => {
      const catalogueId = 'non-existent';
      const ownerId = 'user-123';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      await expect(service.findOne(catalogueId, ownerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a catalogue by slug', async () => {
      const slug = 'test-catalogue';
      const mockCatalogue = { id: '1', publicUrlSlug: slug };

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCatalogue]),
        }),
      } as any);

      const result = await service.findBySlug(slug);

      expect(result).toEqual(mockCatalogue);
    });

    it('should throw NotFoundException when slug not found', async () => {
      const slug = 'non-existent';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      await expect(service.findBySlug(slug)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a catalogue successfully', async () => {
      const catalogueId = 'catalogue-123';
      const ownerId = 'user-123';
      const updateDto = { title: 'Updated Title' };
      const existingCatalogue = {
        id: catalogueId,
        title: 'Old Title',
        ownerId,
        publicUrlSlug: 'old-slug',
      };

      // Mock findOne
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingCatalogue]),
        }),
      } as any);

      // Mock update
      const updatedCatalogue = { ...existingCatalogue, ...updateDto };
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedCatalogue]),
          }),
        }),
      } as any);

      const result = await service.update(catalogueId, updateDto, ownerId);

      expect(result).toBeDefined();
      expect(result!.title).toBe(updateDto.title);
    });

    it('should throw ForbiddenException when user does not own catalogue', async () => {
      const catalogueId = 'catalogue-123';
      const ownerId = 'user-123';
      const differentOwnerId = 'user-456';
      const updateDto = { title: 'Updated Title' };

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: catalogueId, ownerId: differentOwnerId },
          ]),
        }),
      } as any);

      await expect(
        service.update(catalogueId, updateDto, ownerId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a catalogue successfully', async () => {
      const catalogueId = 'catalogue-123';
      const ownerId = 'user-123';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: catalogueId, ownerId }]),
        }),
      } as any);

      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValue(undefined),
      } as any);

      const result = await service.remove(catalogueId, ownerId);

      expect(result.message).toBe('Catalogue deleted successfully');
    });

    it('should throw ForbiddenException when user does not own catalogue', async () => {
      const catalogueId = 'catalogue-123';
      const ownerId = 'user-123';
      const differentOwnerId = 'user-456';

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: catalogueId, ownerId: differentOwnerId },
          ]),
        }),
      } as any);

      await expect(service.remove(catalogueId, ownerId)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
