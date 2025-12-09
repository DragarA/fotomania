import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
});

export type UpdateCollectionDto = z.infer<typeof updateCollectionSchema>;

// Class for Swagger documentation
export class UpdateCollectionDtoClass {
  @ApiProperty({
    description: 'Collection name',
    required: false,
    example: 'Ceremony Photos',
  })
  name!: string;
}
