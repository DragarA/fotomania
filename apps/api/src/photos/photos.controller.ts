import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from '../common/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { UserEntity } from '../common/auth/interfaces/user-entity.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreatePhotoDto,
  CreatePhotoDtoClass,
  createPhotoSchema,
} from './dto/create-photo.dto';
import { PhotoResDto } from './dto/photo-res.dto';
import {
  UpdatePhotoDto,
  UpdatePhotoDtoClass,
  updatePhotoSchema,
} from './dto/update-photo.dto';
import { PhotosService } from './photos.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('photos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new photo' })
  @ApiBody({ type: CreatePhotoDtoClass })
  @ApiResponse({
    status: 201,
    description: 'Photo created successfully',
    type: PhotoResDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body(new ZodValidationPipe(createPhotoSchema)) dto: CreatePhotoDto,
    @User() user: UserEntity
  ) {
    return this.photosService.create(dto, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new photo' })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFiles() files: Express.Multer.File[], @User() user: UserEntity) {
    console.log(files, user)
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
  findAll(@Query('collectionId') collectionId: string, @User() user: UserEntity) {
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a photo' })
  @ApiParam({ name: 'id', description: 'Photo ID' })
  @ApiBody({ type: UpdatePhotoDtoClass })
  @ApiResponse({
    status: 200,
    description: 'Photo updated successfully',
    type: PhotoResDto,
  })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePhotoSchema)) dto: UpdatePhotoDto,
    @User() user: UserEntity
  ) {
    return this.photosService.update(id, dto, user.id);
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
