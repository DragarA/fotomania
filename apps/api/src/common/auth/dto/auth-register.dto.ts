import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const authRegisterSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  name: z.string(),
});

export type AuthRegisterDto = z.infer<typeof authRegisterSchema>;

// Class for Swagger documentation
export class AuthRegisterDtoClass {
  @ApiProperty({ description: 'User Email' })
  email!: string;

  @ApiProperty({ description: 'User Password' })
  password!: string;

  @ApiProperty({ description: 'User Name' })
  name?: string;
}
