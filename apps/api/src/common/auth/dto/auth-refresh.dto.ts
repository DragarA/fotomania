import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const authRefreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type AuthRefreshDto = z.infer<typeof authRefreshSchema>;

export class AuthRefreshDtoClass {
    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        description: 'Refresh token',
    })
    refreshToken!: string;
}
