import { ApiProperty } from '@nestjs/swagger';

export class CatalogueResDto {
    @ApiProperty({
        description: 'Unique identifier for the catalogue',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id!: string;

    @ApiProperty({
        description: 'Title of the catalogue',
        example: 'Summer Wedding 2024',
    })
    title!: string;

    @ApiProperty({
        description: 'Description of the catalogue',
        required: false,
        example: 'Beautiful moments from our summer wedding',
    })
    description?: string | null;

    @ApiProperty({
        description: 'URL of the cover image',
        required: false,
        example: 'https://example.com/images/cover.jpg',
    })
    coverImage?: string | null;

    @ApiProperty({
        description: 'Auto-generated public URL slug',
        example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    })
    publicUrlSlug!: string;

    @ApiProperty({
        description: 'ID of the catalogue owner',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    ownerId!: string;

    @ApiProperty({
        description: 'Timestamp when the catalogue was created',
        example: '2024-12-08T19:00:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'Timestamp when the catalogue was last updated',
        example: '2024-12-08T19:30:00.000Z',
    })
    updatedAt!: Date;

    @ApiProperty({
        description: 'Number of photos in the catalogue',
        example: 150,
    })
    photoCount!: number;

    @ApiProperty({
        description: 'Status of the catalogue',
        example: 'published',
    })
    status!: 'draft' | 'published' | 'deleted';

    @ApiProperty({
        description: 'Indicates if the catalogue is password protected',
        example: false,
    })
    isProtected!: boolean;

    constructor(data: { catalogue: any; photoCount?: any }) {
        Object.assign(this, data.catalogue);
        this.photoCount = data.photoCount;
        this.isProtected = !!data.catalogue.password;
    }
}
