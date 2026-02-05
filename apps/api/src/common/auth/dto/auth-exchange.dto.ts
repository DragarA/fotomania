import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const authExchangeSchema = z.object({
    code: z.string().min(1, 'OAuth code is required'),
});

export type AuthExchangeDto = z.infer<typeof authExchangeSchema>;

export class AuthExchangeDtoClass {
    @ApiProperty({
        example: '0d64f7b4-7b0b-4a3e-97d9-3b6f2f3d4d2a',
        description: 'OAuth exchange code',
    })
    code!: string;
}
