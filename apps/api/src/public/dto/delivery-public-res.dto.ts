import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeliveryPublicResDto {
    @ApiProperty({
        description: 'Delivery collection ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id!: string;

    @ApiProperty({
        description: 'Delivery collection name',
        example: 'Delivery - client@example.com',
    })
    name!: string;

    @ApiPropertyOptional({
        description: 'Client email address',
        example: 'client@example.com',
    })
    clientEmail?: string | null;

    @ApiProperty({
        description: 'Parent catalogue title',
        example: 'Wedding Photos 2024',
    })
    catalogueTitle!: string;

    @ApiProperty({
        description: 'Delivery slug for URL',
        example: 'abc123-def456',
    })
    deliverySlug!: string;

    @ApiProperty({
        description: 'Number of photos in the delivery collection',
        example: 42,
    })
    photoCount!: number;

    constructor(data: {
        collection: {
            id: string;
            name: string;
            deliverySlug: string | null;
        };
        clientEmail: string | null;
        catalogueTitle: string;
        photoCount: number;
    }) {
        Object.assign(this, data);
    }
}

