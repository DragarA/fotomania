import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type CollectionType = 'proofing' | 'delivery';

export class CollectionResDto {
    @ApiProperty({
        description: 'Unique identifier for the collection',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id!: string;

    @ApiProperty({
        description: 'Name of the collection',
        example: 'Ceremony Photos',
    })
    name!: string;

    @ApiProperty({
        description: 'ID of the catalogue this collection belongs to',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    catalogueId!: string;

    @ApiProperty({
        description: 'Type of collection',
        enum: ['proofing', 'delivery'],
        example: 'proofing',
    })
    type!: CollectionType;

    @ApiPropertyOptional({
        description: 'ID of the client session this delivery collection was created from',
        example: '550e8400-e29b-41d4-a716-446655440002',
    })
    clientSessionId?: string;

    @ApiPropertyOptional({
        description: 'Public delivery URL slug for delivery collections',
        example: 'abc123xyz',
    })
    deliverySlug?: string;

    @ApiProperty({
        description: 'Timestamp when the collection was created',
        example: '2024-12-08T19:00:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'Timestamp when the collection was last updated',
        example: '2024-12-08T19:30:00.000Z',
    })
    updatedAt!: Date;

    @ApiProperty({
        description: 'Number of photos in the collection',
        example: 42,
    })
    photoCount!: number;

    @ApiPropertyOptional({
        description: 'Email of the client for delivery collections',
        example: 'client@example.com',
    })
    clientEmail?: string;

    constructor(data: { collection: any; photoCount: any; clientEmail?: string }) {
        Object.assign(this, data.collection);
        this.photoCount = data.photoCount;
        this.clientEmail = data.clientEmail;
    }
}
