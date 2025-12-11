import { ApiProperty } from '@nestjs/swagger';

interface SessionDbData {
  sessionId: string;
  email: string;
  createdAt: Date;
  photoCount: number;
}

class PhotoDto {
  @ApiProperty({ description: 'Photo ID' })
  id!: string;

  @ApiProperty({ description: 'Original filename' })
  originalFileName!: string;

  @ApiProperty({ description: 'Storage path' })
  storagePath!: string;

  @ApiProperty({ description: 'Thumbnail path' })
  thumbnailPath?: string;

  @ApiProperty({ description: 'MIME type' })
  mimeType!: string;

  @ApiProperty({ description: 'Width in pixels' })
  width?: number;

  @ApiProperty({ description: 'Height in pixels' })
  height?: number;

  @ApiProperty({ description: 'File size in bytes' })
  size?: number;

  @ApiProperty({ description: 'Collection ID' })
  collectionId!: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}

export class ClientFavouritesResDto {
  @ApiProperty({ description: 'Client session ID' })
  sessionId!: string;

  @ApiProperty({ description: 'Client email address' })
  email!: string;

  @ApiProperty({ description: 'Session created timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Array of favorited photos' })
  photoCount!: number;

  constructor(data: SessionDbData) {
    this.sessionId = data.sessionId;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.photoCount = data.photoCount || 0;
  }
}
