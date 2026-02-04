import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const addFavouritesSchema = z.object({
    email: z.email('Invalid email address'),
    photoIds: z.array(z.string()).min(1, 'At least one photo ID is required'),
    clientName: z.string().optional(),
    clientAddressStreet: z.string().optional(),
    clientAddressCity: z.string().optional(),
    clientAddressPostalCode: z.string().optional(),
    clientAddressCountry: z.string().optional(),
    clientPhoneNumber: z.string().optional(),
    clientNotes: z.string().optional(),
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

    @ApiPropertyOptional({
        description: 'Client full name',
        example: 'John Doe',
    })
    clientName?: string;

    @ApiPropertyOptional({
        description: 'Client street address',
        example: '123 Main Street',
    })
    clientAddressStreet?: string;

    @ApiPropertyOptional({
        description: 'Client city',
        example: 'Ljubljana',
    })
    clientAddressCity?: string;

    @ApiPropertyOptional({
        description: 'Client postal code',
        example: '1000',
    })
    clientAddressPostalCode?: string;

    @ApiPropertyOptional({
        description: 'Client country',
        example: 'Slovenia',
    })
    clientAddressCountry?: string;

    @ApiPropertyOptional({
        description: 'Client phone number',
        example: '+386 1 234 5678',
    })
    clientPhoneNumber?: string;

    @ApiPropertyOptional({
        description: 'Additional notes from the client',
        example: 'Please deliver photos by email',
    })
    clientNotes?: string;
}
