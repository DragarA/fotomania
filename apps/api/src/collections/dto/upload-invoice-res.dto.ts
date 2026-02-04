import { ApiProperty } from '@nestjs/swagger';

export class UploadInvoiceResDto {
    @ApiProperty({
        description: 'Success message',
        example: 'Invoice uploaded successfully',
    })
    message!: string;

    @ApiProperty({
        description: 'Whether the collection now has an invoice',
        example: true,
    })
    hasInvoice!: boolean;

    constructor(message: string, hasInvoice: boolean) {
        this.message = message;
        this.hasInvoice = hasInvoice;
    }
}
