import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateCatalogueStatusSchema = z.object({
    status: z.enum(['draft', 'published', 'deleted']),
    password: z.string().optional().nullable(),
});

export type UpdateCatalogueStatusDto = z.infer<
    typeof updateCatalogueStatusSchema
>;

// Class for Swagger documentation
export class UpdateCatalogueStatusDtoClass {
    @ApiProperty({
        description: 'Status of the catalogue',
        required: true,
        example: 'draft',
    })
    status!: 'draft' | 'published' | 'deleted';

    @ApiProperty({
        description: 'Catalogue password for public access',
        required: false,
        example: 'secret123!',
    })
    password?: string;
}
