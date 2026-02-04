import { ApiProperty } from '@nestjs/swagger';

import { PhotoResDto } from '../../photos/dto/photo-res.dto';

interface ClientFavouritesData {
    sessionId: string;
    email: string;
    createdAt: Date;
    photos: any[];
    clientName?: string | null;
    clientAddressStreet?: string | null;
    clientAddressCity?: string | null;
    clientAddressPostalCode?: string | null;
    clientAddressCountry?: string | null;
    clientPhoneNumber?: string | null;
    clientNotes?: string | null;
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

    @ApiProperty({
        description: 'Client full name',
        required: false,
        nullable: true,
        example: 'John Doe',
    })
    clientName?: string | null;

    @ApiProperty({
        description: 'Client street address',
        required: false,
        nullable: true,
        example: '123 Main Street',
    })
    clientAddressStreet?: string | null;

    @ApiProperty({
        description: 'Client city',
        required: false,
        nullable: true,
        example: 'Ljubljana',
    })
    clientAddressCity?: string | null;

    @ApiProperty({
        description: 'Client postal code',
        required: false,
        nullable: true,
        example: '1000',
    })
    clientAddressPostalCode?: string | null;

    @ApiProperty({
        description: 'Client country',
        required: false,
        nullable: true,
        example: 'Slovenia',
    })
    clientAddressCountry?: string | null;

    @ApiProperty({
        description: 'Client phone number',
        required: false,
        nullable: true,
        example: '+386 1 234 5678',
    })
    clientPhoneNumber?: string | null;

    @ApiProperty({
        description: 'Additional notes from the client',
        required: false,
        nullable: true,
        example: 'Please deliver photos by email',
    })
    clientNotes?: string | null;

    constructor(data: ClientFavouritesData) {
        const {
            sessionId,
            email,
            createdAt,
            photos,
            clientName,
            clientAddressStreet,
            clientAddressCity,
            clientAddressPostalCode,
            clientAddressCountry,
            clientPhoneNumber,
            clientNotes,
        } = data;
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
        this.clientName = clientName ?? null;
        this.clientAddressStreet = clientAddressStreet ?? null;
        this.clientAddressCity = clientAddressCity ?? null;
        this.clientAddressPostalCode = clientAddressPostalCode ?? null;
        this.clientAddressCountry = clientAddressCountry ?? null;
        this.clientPhoneNumber = clientPhoneNumber ?? null;
        this.clientNotes = clientNotes ?? null;
    }
}
