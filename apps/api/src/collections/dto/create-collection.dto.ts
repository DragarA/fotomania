import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createCollectionSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    catalogueId: z.uuid('Catalogue ID must be a valid UUID'),
});

export type CreateCollectionDto = z.infer<typeof createCollectionSchema>;

// Class for Swagger documentation
export class CreateCollectionDtoClass {
    @ApiProperty({
        description: 'Collection name',
        example: 'Ceremony Photos',
    })
    name!: string;

    @ApiProperty({
        description: 'ID of the catalogue this collection belongs to',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    catalogueId!: string;
}
