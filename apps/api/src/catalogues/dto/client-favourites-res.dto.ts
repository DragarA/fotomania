import { ApiProperty } from '@nestjs/swagger';

interface SessionDbData {
    sessionId: string;
    email: string;
    createdAt: Date;
    photoCount: number;
    clientName?: string | null;
    clientAddressStreet?: string | null;
    clientAddressCity?: string | null;
    clientAddressPostalCode?: string | null;
    clientAddressCountry?: string | null;
    clientPhoneNumber?: string | null;
    clientNotes?: string | null;
}

export class ClientFavouritesResDto {
    @ApiProperty({ description: 'Client session ID' })
    sessionId!: string;

    @ApiProperty({ description: 'Client email address' })
    email!: string;

    @ApiProperty({ description: 'Session created timestamp' })
    createdAt!: Date;

    @ApiProperty({ description: 'Number of favorited photos' })
    photoCount!: number;

    @ApiProperty({
        description: 'Client full name',
        required: false,
        nullable: true,
    })
    clientName?: string | null;

    @ApiProperty({
        description: 'Client street address',
        required: false,
        nullable: true,
    })
    clientAddressStreet?: string | null;

    @ApiProperty({
        description: 'Client city',
        required: false,
        nullable: true,
    })
    clientAddressCity?: string | null;

    @ApiProperty({
        description: 'Client postal code',
        required: false,
        nullable: true,
    })
    clientAddressPostalCode?: string | null;

    @ApiProperty({
        description: 'Client country',
        required: false,
        nullable: true,
    })
    clientAddressCountry?: string | null;

    @ApiProperty({
        description: 'Client phone number',
        required: false,
        nullable: true,
    })
    clientPhoneNumber?: string | null;

    @ApiProperty({
        description: 'Additional notes from client',
        required: false,
        nullable: true,
    })
    clientNotes?: string | null;

    constructor(data: SessionDbData) {
        this.sessionId = data.sessionId;
        this.email = data.email;
        this.createdAt = data.createdAt;
        this.photoCount = data.photoCount || 0;
        this.clientName = data.clientName ?? null;
        this.clientAddressStreet = data.clientAddressStreet ?? null;
        this.clientAddressCity = data.clientAddressCity ?? null;
        this.clientAddressPostalCode = data.clientAddressPostalCode ?? null;
        this.clientAddressCountry = data.clientAddressCountry ?? null;
        this.clientPhoneNumber = data.clientPhoneNumber ?? null;
        this.clientNotes = data.clientNotes ?? null;
    }
}
