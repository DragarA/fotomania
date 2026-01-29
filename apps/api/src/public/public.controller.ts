import * as fs from 'fs';
import * as path from 'path';

import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import archiver from 'archiver';
import { Request, Response } from 'express';

import { CataloguesService } from '../catalogues/catalogues.service';
import { ClientSessionsService } from '../client-sessions/client-sessions.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PhotosService } from '../photos/photos.service';

import {
    AddFavouritesReqDto,
    AddFavouritesReqDtoClass,
    addFavouritesSchema,
} from './dto/add-favourites-req.dto';
import { AddFavouritesResDto } from './dto/add-favourites-res.dto';
import { CataloguePublicResDto } from './dto/catalogue-public-res.dto';
import { CollectionPhotoPublicResDto } from './dto/collection-photo-public-res.dto';
import { DeliveryPublicResDto } from './dto/delivery-public-res.dto';
import {
    VerifyPasswordReqDto,
    VerifyPasswordReqDtoClass,
    VerifyPasswordResDto,
    verifyPasswordSchema,
} from './dto/verify-password.dto';
import { DeliveryAccessGuard } from './guards/delivery-access.guard';
import { PublicAccessGuard } from './guards/public-access.guard';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
    constructor(
        private readonly cataloguesService: CataloguesService,
        private readonly photosService: PhotosService,
        private readonly clientSessionsService: ClientSessionsService,
        private readonly publicService: PublicService
    ) {}

    @Post('/catalogue/:slug/verify')
    @ApiOperation({ summary: 'Verify password for a protected catalogue' })
    @ApiParam({ name: 'slug', description: 'Public URL slug' })
    @ApiBody({ type: VerifyPasswordReqDtoClass })
    @ApiResponse({
        status: 200,
        description: 'Password verified, returns access token',
        type: VerifyPasswordResDto,
    })
    @ApiResponse({ status: 401, description: 'Invalid password' })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    async verifyPassword(
        @Param('slug') slug: string,
        @Body(new ZodValidationPipe(verifyPasswordSchema))
        body: VerifyPasswordReqDto
    ) {
        const accessToken = await this.publicService.verifyPassword(
            slug,
            body.password
        );
        return new VerifyPasswordResDto(accessToken);
    }

    @Get('/catalogue/:slug')
    @UseGuards(PublicAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get public catalogue data by public URL slug' })
    @ApiParam({ name: 'slug', description: 'Public URL slug' })
    @ApiResponse({
        status: 200,
        description: 'Returns the catalogue',
        type: CataloguePublicResDto,
    })
    @ApiResponse({ status: 401, description: 'Password required or invalid token' })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    async findBySlug(@Param('slug') slug: string) {
        const result = await this.cataloguesService.findPublicBySlug(slug);
        return new CataloguePublicResDto(result);
    }

    @Get('/catalogue/:slug/collection/:collectionId/photos')
    @UseGuards(PublicAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get photos for a public collection' })
    @ApiParam({ name: 'slug', description: 'Public URL slug' })
    @ApiParam({ name: 'collectionId', description: 'Collection ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns the photos',
        type: [CollectionPhotoPublicResDto],
    })
    @ApiResponse({ status: 401, description: 'Password required or invalid token' })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    async findCollectionPhotosBySlug(
        @Param('slug') slug: string,
        @Param('collectionId') collectionId: string
    ) {
        const result = await this.photosService.findPublicBySlugAndCollection(
            slug,
            collectionId
        );
        return result.map((photo) => new CollectionPhotoPublicResDto(photo));
    }

    @Post('/catalogue/:slug/favourites')
    @UseGuards(PublicAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add favourite photos for a client' })
    @ApiParam({ name: 'slug', description: 'Public URL slug' })
    @ApiBody({ type: AddFavouritesReqDtoClass })
    @ApiResponse({
        status: 201,
        description: 'Favourites added successfully',
        type: AddFavouritesResDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request payload' })
    @ApiResponse({
        status: 401,
        description: 'Password required or invalid token',
    })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    async addFavourites(
        @Param('slug') slug: string,
        @Body(new ZodValidationPipe(addFavouritesSchema))
        body: AddFavouritesReqDto
    ) {
        const result = await this.clientSessionsService.addFavourites(
            slug,
            body.email,
            body.photoIds
        );
        return new AddFavouritesResDto(result?.email, true);
    }

    @Post('/delivery/:deliverySlug/verify')
    @ApiOperation({
        summary: 'Verify password for a protected delivery collection',
    })
    @ApiParam({ name: 'deliverySlug', description: 'Delivery URL slug' })
    @ApiBody({ type: VerifyPasswordReqDtoClass })
    @ApiResponse({
        status: 200,
        description: 'Password verified, returns access token',
        type: VerifyPasswordResDto,
    })
    @ApiResponse({ status: 401, description: 'Invalid password' })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    async verifyDeliveryPassword(
        @Param('deliverySlug') deliverySlug: string,
        @Body(new ZodValidationPipe(verifyPasswordSchema))
        body: VerifyPasswordReqDto
    ) {
        const accessToken = await this.publicService.verifyDeliveryPassword(
            deliverySlug,
            body.password
        );
        return new VerifyPasswordResDto(accessToken);
    }

    @Get('/delivery/:deliverySlug')
    @UseGuards(DeliveryAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get delivery collection data by slug' })
    @ApiParam({ name: 'deliverySlug', description: 'Delivery URL slug' })
    @ApiResponse({
        status: 200,
        description: 'Returns the delivery collection info',
        type: DeliveryPublicResDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Password required or invalid token',
    })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    async findDeliveryBySlug(@Param('deliverySlug') deliverySlug: string) {
        const result = await this.publicService.findDeliveryBySlug(deliverySlug);
        return new DeliveryPublicResDto(result);
    }

    @Get('/delivery/:deliverySlug/photos')
    @UseGuards(DeliveryAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get photos for a delivery collection' })
    @ApiParam({ name: 'deliverySlug', description: 'Delivery URL slug' })
    @ApiResponse({ status: 200, type: [CollectionPhotoPublicResDto] })
    @ApiResponse({
        status: 401,
        description: 'Password required or invalid token',
    })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    async findDeliveryPhotos(@Param('deliverySlug') deliverySlug: string) {
        const photos = await this.publicService.findDeliveryPhotos(deliverySlug);
        return photos.map((photo) => new CollectionPhotoPublicResDto(photo));
    }

    @Get('/delivery/:deliverySlug/photo/:photoId/download')
    @UseGuards(DeliveryAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Download a single photo from a delivery' })
    @ApiParam({ name: 'deliverySlug', description: 'Delivery URL slug' })
    @ApiParam({ name: 'photoId', description: 'Photo ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns the photo file',
    })
    @ApiResponse({
        status: 401,
        description: 'Password required or invalid token',
    })
    @ApiResponse({ status: 404, description: 'Photo or delivery not found' })
    async downloadDeliveryPhoto(
        @Param('deliverySlug') deliverySlug: string,
        @Param('photoId') photoId: string,
        @Res() res: Response
    ) {
        const photoData = await this.publicService.findDeliveryPhoto(
            deliverySlug,
            photoId
        );

        const uploadRoot = path.resolve('./uploads');
        const filePath = path.join(uploadRoot, photoData.storagePath);

        if (!fs.existsSync(filePath)) {
            res.status(404).send('File not found');
            return;
        }

        // Determine content type based on file extension
        const ext = path.extname(photoData.originalFileName).toLowerCase();
        const contentTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${photoData.originalFileName}"`
        );

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }

    @Get('/delivery/:deliverySlug/download')
    @UseGuards(DeliveryAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Download all photos as a zip file' })
    @ApiParam({ name: 'deliverySlug', description: 'Delivery URL slug' })
    @ApiResponse({
        status: 200,
        description: 'Returns a zip file containing all photos',
    })
    @ApiResponse({
        status: 401,
        description: 'Password required or invalid token',
    })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    async downloadDelivery(
        @Param('deliverySlug') deliverySlug: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const photos = await this.publicService.findDeliveryPhotos(deliverySlug);
        const delivery =
            await this.publicService.findDeliveryBySlug(deliverySlug);

        // Record the download
        const ipAddress =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.socket.remoteAddress;
        await this.publicService.recordDownload(deliverySlug, ipAddress);

        // Set response headers for zip download
        const zipFileName = `${delivery.catalogueTitle.replace(/[^a-zA-Z0-9]/g, '_')}_delivery.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${zipFileName}"`
        );

        // Create archive and pipe to response
        const archive = archiver('zip', { zlib: { level: 5 } });
        archive.pipe(res);

        const uploadRoot = path.resolve('./uploads');

        // Add each photo to the archive
        for (const photo of photos) {
            const filePath = path.join(uploadRoot, photo.storagePath);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: photo.originalFileName });
            }
        }

        await archive.finalize();
    }
}
