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

    @ApiProperty({
        description: 'Whether the delivery has an attached invoice',
        example: true,
    })
    hasInvoice!: boolean;

    @ApiProperty({
        description: 'Photographer business name',
        required: false,
        nullable: true,
        example: 'Photo Studio Pro',
    })
    photographerBusinessName?: string | null;

    @ApiProperty({
        description: 'Photographer business website',
        required: false,
        nullable: true,
        example: 'https://photostudio.com',
    })
    photographerBusinessWebsite?: string | null;

    @ApiProperty({
        description: 'Photographer logo URL',
        required: false,
        nullable: true,
        example: './uploads/logos/user-123/logo.png',
    })
    photographerLogo?: string | null;

    @ApiProperty({
        description: 'Photographer brand main color',
        required: false,
        nullable: true,
        example: '#292524',
    })
    photographerBrandColorMain?: string | null;

    @ApiProperty({
        description: 'Photographer brand accent color',
        required: false,
        nullable: true,
        example: '#78716c',
    })
    photographerBrandColorAccent?: string | null;

    constructor(data: {
        collection: {
            id: string;
            name: string;
            deliverySlug: string | null;
        };
        clientEmail: string | null;
        catalogueTitle: string;
        photoCount: number;
        hasInvoice?: boolean;
        photographerBusinessName?: string | null;
        photographerBusinessWebsite?: string | null;
        photographerLogo?: string | null;
        photographerBrandColorMain?: string | null;
        photographerBrandColorAccent?: string | null;
    }) {
        this.id = data.collection.id;
        this.name = data.collection.name;
        this.deliverySlug = data.collection.deliverySlug ?? '';
        this.clientEmail = data.clientEmail;
        this.catalogueTitle = data.catalogueTitle;
        this.photoCount = data.photoCount;
        this.hasInvoice = data.hasInvoice ?? false;
        this.photographerBusinessName = data.photographerBusinessName ?? null;
        this.photographerBusinessWebsite =
            data.photographerBusinessWebsite ?? null;
        this.photographerLogo = data.photographerLogo ?? null;
        this.photographerBrandColorMain =
            data.photographerBrandColorMain ?? null;
        this.photographerBrandColorAccent =
            data.photographerBrandColorAccent ?? null;
    }
}
