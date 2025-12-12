import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { User } from '../common/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { UserEntity } from '../common/auth/interfaces/user-entity.interface';

import { PhotoResDto } from './dto/photo-res.dto';
import { photoFileFilter, photoStorageMemory } from './multer.config';
import { PhotosService } from './photos.service';

@ApiTags('photos')
@Controller('photos')
export class PhotosController {
    constructor(private readonly photosService: PhotosService) {}

    @Post('upload/:collectionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Upload a photo file' })
    @ApiParam({ name: 'collectionId', description: 'Collection ID' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: photoStorageMemory,
            fileFilter: photoFileFilter,
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        })
    )
    @ApiResponse({
        status: 201,
        description: 'Photo uploaded successfully',
        type: PhotoResDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid file or request data' })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('collectionId') collectionId: string,
        @User() user: UserEntity
    ) {
        return this.photosService.uploadFile(file, collectionId, user.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all photos for a collection' })
    @ApiQuery({
        name: 'collectionId',
        description: 'Collection ID to filter photos',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Returns all photos for the collection',
        type: [PhotoResDto],
    })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    findAll(
        @Query('collectionId') collectionId: string,
        @User() user: UserEntity
    ) {
        return this.photosService.findAll(collectionId, user.id);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get a photo by ID' })
    @ApiParam({ name: 'id', description: 'Photo ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns the photo',
        type: PhotoResDto,
    })
    @ApiResponse({ status: 404, description: 'Photo not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    findOne(@Param('id') id: string, @User() user: UserEntity) {
        return this.photosService.findOne(id, user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Delete a photo' })
    @ApiParam({ name: 'id', description: 'Photo ID' })
    @ApiResponse({
        status: 200,
        description: 'Photo deleted successfully',
    })
    @ApiResponse({ status: 404, description: 'Photo not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    remove(@Param('id') id: string, @User() user: UserEntity) {
        return this.photosService.remove(id, user.id);
    }
}
