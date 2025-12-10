import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const addFavouritesSchema = z.object({
  email: z.string().email('Invalid email address'),
  photoIds: z.array(z.string()).min(1, 'At least one photo ID is required'),
});

export type AddFavouritesReqDto = z.infer<typeof addFavouritesSchema>;

// Class for Swagger documentation
export class AddFavouritesReqDtoClass {
  @ApiProperty({
    description: 'Email address of the client',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Array of photo IDs to mark as favourites',
    example: [
      '9b5c4e28-2bd3-4e43-9f75-7dd29586a7b4',
      'a3f1c2d8-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    ],
    type: [String],
  })
  photoIds!: string[];
}
