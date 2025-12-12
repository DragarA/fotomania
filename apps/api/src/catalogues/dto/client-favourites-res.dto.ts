import { ApiProperty } from '@nestjs/swagger';

interface SessionDbData {
    sessionId: string;
    email: string;
    createdAt: Date;
    photoCount: number;
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
