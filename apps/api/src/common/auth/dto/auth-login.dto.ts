import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const authLoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type AuthLoginDto = z.infer<typeof authLoginSchema>;

// Class for Swagger documentation
export class AuthLoginDtoClass {
  @ApiProperty({ description: 'User Email' })
  email!: string;

  @ApiProperty({ description: 'User Password' })
  password!: string;
}
