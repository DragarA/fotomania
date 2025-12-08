import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createCatalogueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().optional(),
  password: z.string().optional(),
});

export type CreateCatalogueDto = z.infer<typeof createCatalogueSchema>;

// Class for Swagger documentation
export class CreateCatalogueDtoClass {
  @ApiProperty({ description: 'Catalogue title', example: 'Summer Wedding 2024' })
  title!: string;

  @ApiProperty({
    description: 'Catalogue description',
    required: false,
    example: 'Beautiful moments from our summer wedding',
  })
  description?: string;

  @ApiProperty({
    description: 'Password for protected catalogue',
    required: false,
    example: 'secret123',
  })
  password?: string;
}
