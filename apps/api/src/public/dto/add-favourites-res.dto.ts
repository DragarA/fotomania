import { ApiProperty } from '@nestjs/swagger';

export class AddFavouritesResDto {
    @ApiProperty({
        description: 'Success indicator',
        example: true,
    })
    success!: boolean;

    @ApiProperty({
        description: 'Client session email associated with the favourites',
        example: 'test@email.com',
    })
    clientSessionEmail?: string;

    constructor(clientSessionEmail?: string, success: boolean = true) {
        this.success = success;
        this.clientSessionEmail = clientSessionEmail;
    }
}
