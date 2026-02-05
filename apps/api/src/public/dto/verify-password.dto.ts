import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const verifyPasswordSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

export type VerifyPasswordReqDto = z.infer<typeof verifyPasswordSchema>;

// Class for Swagger documentation
export class VerifyPasswordReqDtoClass {
    @ApiProperty({
        description: 'Password to access the protected catalogue',
        example: 'secret123',
    })
    password!: string;
}

export class VerifyPasswordResDto {
    @ApiProperty({
        description: 'Access token for accessing protected catalogue',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken!: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }
}
