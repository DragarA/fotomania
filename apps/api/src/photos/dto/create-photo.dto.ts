import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const createPhotoSchema = z.object({
    originalFileName: z
        .string()
        .min(1, 'Original filename is required')
        .max(255, 'Filename is too long'),
    storagePath: z
        .string()
        .min(1, 'Storage path is required')
        .max(500, 'Storage path is too long'),
    mimeType: z
        .string()
        .min(1, 'MIME type is required')
        .max(100, 'MIME type is too long'),
    thumbnailPath: z.string().max(500, 'Thumbnail path is too long').optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    size: z.number().int().positive().optional(),
    collectionId: z.string().uuid('Collection ID must be a valid UUID'),
});

export type CreatePhotoDto = z.infer<typeof createPhotoSchema>;

export class CreatePhotoDtoClass {
    @ApiProperty({
        description: 'Original filename of the photo',
        example: 'wedding-ceremony-001.jpg',
    })
    originalFileName!: string;

    @ApiProperty({
        description: 'Storage path where the photo is stored',
        example: '/uploads/catalogues/abc123/photos/uuid.jpg',
    })
    storagePath!: string;

    @ApiProperty({
        description: 'MIME type of the photo',
        example: 'image/jpeg',
    })
    mimeType!: string;

    @ApiPropertyOptional({
        description: 'Path to the thumbnail image',
        example: '/uploads/catalogues/abc123/thumbnails/uuid.jpg',
    })
    thumbnailPath?: string;

    @ApiPropertyOptional({
        description: 'Width of the photo in pixels',
        example: 1920,
    })
    width?: number;

    @ApiPropertyOptional({
        description: 'Height of the photo in pixels',
        example: 1080,
    })
    height?: number;

    @ApiPropertyOptional({
        description: 'File size in bytes',
        example: 2048576,
    })
    size?: number;

    @ApiProperty({
        description: 'ID of the collection this photo belongs to',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    collectionId!: string;
}
