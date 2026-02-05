import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiQuery,
    ApiConsumes,
} from '@nestjs/swagger';

import { User } from '../common/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { UserEntity } from '../common/auth/interfaces/user-entity.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { CollectionsService } from './collections.service';
import { CollectionResDto } from './dto/collection-res.dto';
import {
    CreateCollectionDto,
    CreateCollectionDtoClass,
    createCollectionSchema,
} from './dto/create-collection.dto';
import {
    UpdateCollectionDto,
    UpdateCollectionDtoClass,
    updateCollectionSchema,
} from './dto/update-collection.dto';
import { UploadInvoiceResDto } from './dto/upload-invoice-res.dto';
import {
    invoiceFileFilter,
    invoiceStorage,
    INVOICE_MAX_SIZE,
} from './multer-invoice.config';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
    constructor(private readonly collectionsService: CollectionsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a new collection' })
    @ApiBody({ type: CreateCollectionDtoClass })
    @ApiResponse({
        status: 201,
        description: 'Collection created successfully',
        type: CollectionResDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    create(
        @Body(new ZodValidationPipe(createCollectionSchema))
        dto: CreateCollectionDto,
        @User() user: UserEntity
    ) {
        return this.collectionsService.create(dto, user.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all collections for a catalogue' })
    @ApiQuery({
        name: 'catalogueId',
        description: 'Catalogue ID to filter collections',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Returns all collections for the catalogue',
        type: [CollectionResDto],
    })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findAll(
        @Query('catalogueId') catalogueId: string,
        @User() user: UserEntity
    ) {
        const data = await this.collectionsService.findAll(
            catalogueId,
            user.id
        );
        return data.map(
            ({ collection, photoCount, clientEmail }) =>
                new CollectionResDto({
                    collection,
                    photoCount,
                    clientEmail: clientEmail || undefined,
                })
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get a collection by ID' })
    @ApiParam({ name: 'id', description: 'Collection ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns the collection',
        type: CollectionResDto,
    })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findOne(@Param('id') id: string, @User() user: UserEntity) {
        const data = await this.collectionsService.findOne(id, user.id);
        return new CollectionResDto({
            collection: data.collection,
            photoCount: data.photoCount,
            clientEmail: data.clientEmail || undefined,
        });
    }

    @Post('from-session/:sessionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Create a delivery collection from a client session',
    })
    @ApiParam({
        name: 'sessionId',
        description: 'Client session ID (favourites session)',
    })
    @ApiResponse({
        status: 201,
        description: 'Delivery collection created successfully',
        type: CollectionResDto,
    })
    @ApiResponse({ status: 404, description: 'Session not found' })
    @ApiResponse({
        status: 400,
        description: 'Delivery collection already exists',
    })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async createFromSession(
        @Param('sessionId') sessionId: string,
        @User() user: UserEntity
    ) {
        const data = await this.collectionsService.createDeliveryCollection(
            sessionId,
            user.id
        );
        return new CollectionResDto(data);
    }

    @Get(':id/downloads')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get download history for a delivery collection' })
    @ApiParam({ name: 'id', description: 'Collection ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns download history',
    })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({ status: 400, description: 'Not a delivery collection' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getDownloadHistory(
        @Param('id') id: string,
        @User() user: UserEntity
    ) {
        return this.collectionsService.getDownloadHistory(id, user.id);
    }

    @Post(':id/send-delivery-email')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Send delivery ready email to the client' })
    @ApiParam({ name: 'id', description: 'Collection ID' })
    @ApiResponse({
        status: 200,
        description: 'Delivery email sent successfully',
    })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({
        status: 400,
        description: 'Not a delivery collection or no client email',
    })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async sendDeliveryEmail(@Param('id') id: string, @User() user: UserEntity) {
        return this.collectionsService.sendDeliveryEmail(id, user.id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a collection' })
    @ApiParam({ name: 'id', description: 'Collection ID' })
    @ApiBody({ type: UpdateCollectionDtoClass })
    @ApiResponse({
        status: 200,
        description: 'Collection updated successfully',
        type: CollectionResDto,
    })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(updateCollectionSchema))
        dto: UpdateCollectionDto,
        @User() user: UserEntity
    ) {
        return this.collectionsService.update(id, dto, user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Delete a collection' })
    @ApiParam({ name: 'id', description: 'Collection ID' })
    @ApiResponse({
        status: 200,
        description: 'Collection deleted successfully',
    })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    remove(@Param('id') id: string, @User() user: UserEntity) {
        return this.collectionsService.remove(id, user.id);
    }

    @Post(':id/invoice')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: invoiceStorage,
            fileFilter: invoiceFileFilter,
            limits: { fileSize: INVOICE_MAX_SIZE },
        })
    )
    @ApiOperation({ summary: 'Upload an invoice PDF to a delivery collection' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'id', description: 'Collection ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF invoice file (max 10MB)',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Invoice uploaded successfully',
        type: UploadInvoiceResDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid file type or not a delivery collection',
    })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async uploadInvoice(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @User() user: UserEntity
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const result = await this.collectionsService.uploadInvoice(
            file,
            id,
            user.id
        );
        return new UploadInvoiceResDto(result.message, result.hasInvoice);
    }

    @Delete(':id/invoice')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Remove invoice from a delivery collection' })
    @ApiParam({ name: 'id', description: 'Collection ID' })
    @ApiResponse({
        status: 200,
        description: 'Invoice removed successfully',
        type: UploadInvoiceResDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Collection or invoice not found',
    })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async removeInvoice(@Param('id') id: string, @User() user: UserEntity) {
        const result = await this.collectionsService.removeInvoice(id, user.id);
        return new UploadInvoiceResDto(result.message, result.hasInvoice);
    }
}
