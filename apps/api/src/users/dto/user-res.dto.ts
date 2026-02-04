import { ApiProperty } from '@nestjs/swagger';

export class UserResDto {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id!: string;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
    })
    name!: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
    })
    email!: string;

    @ApiProperty({
        description: 'Whether the email has been verified',
        example: true,
    })
    emailVerified!: boolean;

    @ApiProperty({
        description: 'Profile image URL',
        required: false,
        nullable: true,
        example: 'https://example.com/avatar.jpg',
    })
    image?: string | null;

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
        description: 'Preferred language code',
        example: 'en',
    })
    preferredLanguage!: string;

    @ApiProperty({
        description: 'Timestamp when the user was created',
        example: '2024-12-08T19:00:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'Timestamp when the user was last updated',
        example: '2024-12-08T19:30:00.000Z',
    })
    updatedAt!: Date;

    @ApiProperty({
        description: 'Whether to collect client name',
        example: true,
    })
    collectClientName!: boolean;

    @ApiProperty({
        description: 'Whether to collect client address',
        example: false,
    })
    collectClientAddress!: boolean;

    @ApiProperty({
        description: 'Whether to collect client phone number',
        example: true,
    })
    collectClientPhone!: boolean;

    @ApiProperty({
        description: 'Whether to collect client notes',
        example: false,
    })
    collectClientNotes!: boolean;

    constructor(user: any) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.emailVerified = user.emailVerified;
        this.image = user.image;
        this.businessName = user.businessName;
        this.businessAddress = user.businessAddress;
        this.businessPhone = user.businessPhone;
        this.businessEmail = user.businessEmail;
        this.businessWebsite = user.businessWebsite;
        this.businessLogo = user.businessLogo;
        this.businessDescription = user.businessDescription;
        this.preferredLanguage = user.preferredLanguage;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.collectClientName = user.collectClientName;
        this.collectClientAddress = user.collectClientAddress;
        this.collectClientPhone = user.collectClientPhone;
        this.collectClientNotes = user.collectClientNotes;
    }
}

