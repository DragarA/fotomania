import { ApiProperty } from '@nestjs/swagger';

import { PhotoResDto } from '../../photos/dto/photo-res.dto';

interface ClientFavouritesData {
    sessionId: string;
    email: string;
    createdAt: Date;
    photos: any[];
}

export class ClientSessionFavouritesResDto {
    @ApiProperty({ description: 'Client session ID' })
    sessionId!: string;

    @ApiProperty({ description: 'Client email address' })
    email!: string;

    @ApiProperty({ description: 'Session created timestamp' })
    createdAt!: Date;

    @ApiProperty({
        description: 'Array of favorited photos',
        type: [PhotoResDto],
    })
    photos!: PhotoResDto[];

    constructor(data: ClientFavouritesData) {
        const { sessionId, email, createdAt, photos } = data;
        this.sessionId = sessionId;
        this.email = email;
        this.createdAt = createdAt;
        this.photos = photos.map((photo) => ({
            collectionId: photo.collectionId,
            height: photo.height,
            id: photo.id,
            mimeType: photo.mimeType,
            originalFileName: photo.originalFileName,
            size: photo.size,
            storagePath: photo.storagePath,
            thumbnailPath: photo.thumbnailPath,
            width: photo.width,
        }));
    }
}
