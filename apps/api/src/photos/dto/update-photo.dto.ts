import { ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const updatePhotoSchema = z.object({
    originalFileName: z
        .string()
        .min(1, 'Original filename cannot be empty')
        .max(255, 'Filename is too long')
        .optional(),
    storagePath: z
        .string()
        .min(1, 'Storage path cannot be empty')
        .max(500, 'Storage path is too long')
        .optional(),
    mimeType: z
        .string()
        .min(1, 'MIME type cannot be empty')
        .max(100, 'MIME type is too long')
        .optional(),
    thumbnailPath: z
        .string()
        .max(500, 'Thumbnail path is too long')
        .optional()
        .nullable(),
    width: z.number().int().positive().optional().nullable(),
    height: z.number().int().positive().optional().nullable(),
    size: z.number().int().positive().optional().nullable(),
});

export type UpdatePhotoDto = z.infer<typeof updatePhotoSchema>;

export class UpdatePhotoDtoClass {
    @ApiPropertyOptional({
        description: 'Original filename of the photo',
        example: 'wedding-ceremony-001.jpg',
    })
    originalFileName?: string;

    @ApiPropertyOptional({
        description: 'Storage path where the photo is stored',
        example: '/uploads/catalogues/abc123/photos/uuid.jpg',
    })
    storagePath?: string;

    @ApiPropertyOptional({
        description: 'MIME type of the photo',
        example: 'image/jpeg',
    })
    mimeType?: string;

    @ApiPropertyOptional({
        description: 'Path to the thumbnail image',
        example: '/uploads/catalogues/abc123/thumbnails/uuid.jpg',
    })
    thumbnailPath?: string | null;

    @ApiPropertyOptional({
        description: 'Width of the photo in pixels',
        example: 1920,
    })
    width?: number | null;

    @ApiPropertyOptional({
        description: 'Height of the photo in pixels',
        example: 1080,
    })
    height?: number | null;

    @ApiPropertyOptional({
        description: 'File size in bytes',
        example: 2048576,
    })
    size?: number | null;
}
