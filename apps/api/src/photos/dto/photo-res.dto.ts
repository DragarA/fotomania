import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhotoResDto {
  @ApiProperty({
    description: 'Unique identifier for the photo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Original filename of the photo',
    example: 'wedding-ceremony-001.jpg',
  })
  originalFileName!: string;

  @ApiProperty({
    description: 'Storage path where the photo is stored',
    example: '/uploads/catalogues/abc123/photos/uuid.jpg',
  })
  storagePath!: string;

  @ApiProperty({
    description: 'MIME type of the photo',
    example: 'image/jpeg',
  })
  mimeType!: string;

  @ApiPropertyOptional({
    description: 'Path to the thumbnail image',
    example: '/uploads/catalogues/abc123/thumbnails/uuid.jpg',
  })
  thumbnailPath?: string;

  @ApiPropertyOptional({
    description: 'Width of the photo in pixels',
    example: 1920,
  })
  width?: number;

  @ApiPropertyOptional({
    description: 'Height of the photo in pixels',
    example: 1080,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 2048576,
  })
  size?: number;

  @ApiProperty({
    description: 'ID of the collection this photo belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  collectionId!: string;
}
