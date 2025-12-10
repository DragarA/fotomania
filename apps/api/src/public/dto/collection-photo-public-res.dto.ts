import { ApiProperty } from '@nestjs/swagger';

import { photo } from '../../common/db/schema/photos.schema';

type PhotoEntity =
  | typeof photo.$inferSelect
  | (typeof photo.$inferInsert & {
      thumbnailPath?: string | null;
    });

export class CollectionPhotoPublicResDto {
  @ApiProperty({
    description: 'Unique identifier of the photo',
    example: '9b5c4e28-2bd3-4e43-9f75-7dd29586a7b4',
  })
  id!: string;

  @ApiProperty({
    description: 'Original filename uploaded by the photographer',
    example: 'IMG_1042.CR3',
  })
  originalFileName!: string;

  @ApiProperty({
    description: 'Relative path to the processed photo asset',
    example: '/uploads/collections/1234/abcd.jpg',
  })
  storagePath!: string;

  @ApiProperty({
    description: 'Relative path to the thumbnail image, if generated',
    example: '/uploads/collections/1234/thumb_abcd.jpg',
    required: false,
  })
  thumbnailPath?: string | null;

  @ApiProperty({
    description: 'Mime type of the stored photo',
    example: 'image/jpeg',
  })
  mimeType!: string;

  @ApiProperty({
    description: 'Image width in pixels, if available',
    example: 2400,
    required: false,
  })
  width?: number | null;

  @ApiProperty({
    description: 'Image height in pixels, if available',
    example: 1600,
    required: false,
  })
  height?: number | null;

  @ApiProperty({
    description: 'File size in bytes, if available',
    example: 5463221,
    required: false,
  })
  size?: number | null;

  @ApiProperty({
    description: 'Timestamp when the photo was uploaded',
    example: '2024-03-04T19:55:11.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the photo metadata was last updated',
    example: '2024-03-05T10:12:42.000Z',
  })
  updatedAt!: Date;

  constructor(entity: PhotoEntity) {
    this.id = entity.id;
    this.originalFileName = entity.originalFileName;
    this.storagePath = entity.storagePath;
    this.thumbnailPath = entity.thumbnailPath ?? null;
    this.mimeType = entity.mimeType;
    this.width = entity.width ?? null;
    this.height = entity.height ?? null;
    this.size = entity.size ?? null;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
