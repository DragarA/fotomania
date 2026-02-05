import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const SUPPORTED_LANGUAGES = ['en', 'sl'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const updateUserSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name is too long')
        .optional(),
    businessName: z
        .string()
        .max(255, 'Business name is too long')
        .nullable()
        .optional(),
    businessAddress: z
        .string()
        .max(500, 'Business address is too long')
        .nullable()
        .optional(),
    businessPhone: z
        .string()
        .max(50, 'Business phone is too long')
        .nullable()
        .optional(),
    businessEmail: z
        .string()
        .email('Invalid email format')
        .max(255, 'Business email is too long')
        .nullable()
        .optional()
        .or(z.literal('')),
    businessWebsite: z
        .string()
        .url('Invalid URL format')
        .max(500, 'Business website URL is too long')
        .nullable()
        .optional()
        .or(z.literal('')),
    businessLogo: z
        .string()
        .max(500, 'Business logo URL is too long')
        .nullable()
        .optional(),
    businessDescription: z
        .string()
        .max(2000, 'Business description is too long')
        .nullable()
        .optional(),
    brandColorMain: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
        .nullable()
        .optional(),
    brandColorAccent: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
        .nullable()
        .optional(),
    preferredLanguage: z.enum(SUPPORTED_LANGUAGES).optional(),
    collectClientName: z.boolean().optional(),
    collectClientAddress: z.boolean().optional(),
    collectClientPhone: z.boolean().optional(),
    collectClientNotes: z.boolean().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// Class for Swagger documentation
export class UpdateUserDtoClass {
    @ApiProperty({
        description: 'Full name of the user',
        required: false,
        example: 'John Doe',
    })
    name?: string;

    @ApiProperty({
        description: 'Business name',
        required: false,
        nullable: true,
        example: 'Photo Studio Pro',
    })
    businessName?: string | null;

    @ApiProperty({
        description: 'Business address',
        required: false,
        nullable: true,
        example: '123 Main Street, Ljubljana, Slovenia',
    })
    businessAddress?: string | null;

    @ApiProperty({
        description: 'Business phone number',
        required: false,
        nullable: true,
        example: '+386 1 234 5678',
    })
    businessPhone?: string | null;

    @ApiProperty({
        description: 'Business email address',
        required: false,
        nullable: true,
        example: 'contact@photostudio.com',
    })
    businessEmail?: string | null;

    @ApiProperty({
        description: 'Business website URL',
        required: false,
        nullable: true,
        example: 'https://photostudio.com',
    })
    businessWebsite?: string | null;

    @ApiProperty({
        description: 'Business logo URL',
        required: false,
        nullable: true,
        example: 'https://example.com/logo.png',
    })
    businessLogo?: string | null;

    @ApiProperty({
        description: 'Business description',
        required: false,
        nullable: true,
        example: 'Professional photography services for weddings and events.',
    })
    businessDescription?: string | null;

    @ApiProperty({
        description: 'Brand main color (hex format)',
        required: false,
        nullable: true,
        example: '#292524',
    })
    brandColorMain?: string | null;

    @ApiProperty({
        description: 'Brand accent color (hex format)',
        required: false,
        nullable: true,
        example: '#78716c',
    })
    brandColorAccent?: string | null;

    @ApiProperty({
        description: 'Preferred language code',
        required: false,
        enum: SUPPORTED_LANGUAGES,
        example: 'en',
    })
    preferredLanguage?: SupportedLanguage;

    @ApiProperty({
        description: 'Whether to collect client name',
        required: false,
        example: true,
    })
    collectClientName?: boolean;

    @ApiProperty({
        description: 'Whether to collect client address',
        required: false,
        example: false,
    })
    collectClientAddress?: boolean;

    @ApiProperty({
        description: 'Whether to collect client phone number',
        required: false,
        example: true,
    })
    collectClientPhone?: boolean;

    @ApiProperty({
        description: 'Whether to collect client notes',
        required: false,
        example: false,
    })
    collectClientNotes?: boolean;
}
