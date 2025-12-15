import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateCatalogueSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title is too long')
        .optional(),
    description: z.string().optional(),
    coverImage: z.string().nullable().optional(),
});

export type UpdateCatalogueDto = z.infer<typeof updateCatalogueSchema>;

// Class for Swagger documentation
export class UpdateCatalogueDtoClass {
    @ApiProperty({
        description: 'Catalogue title',
        required: false,
        example: 'Summer Wedding 2024',
    })
    title?: string;

    @ApiProperty({
        description: 'Catalogue description',
        required: false,
        example: 'Beautiful moments from our summer wedding',
    })
    description?: string;

    @ApiProperty({
        description: 'Catalogue cover image path',
        required: false,
        nullable: true,
        example: 'collections/abc123/thumb_photo456.jpg',
    })
    coverImage?: string | null;
}
