import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CataloguesService } from '../catalogues/catalogues.service';
import { CataloguePublicResDto } from './dto/catalogue-public-res.dto';
import { PhotosService } from '../photos/photos.service';
import { CollectionPhotoPublicResDto } from './dto/collection-photo-public-res.dto';
import {
  AddFavouritesReqDto,
  AddFavouritesReqDtoClass,
  addFavouritesSchema,
} from './dto/add-favourites-req.dto';
import { AddFavouritesResDto } from './dto/add-favourites-res.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ClientSessionsService } from '../client-sessions/client-sessions.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly cataloguesService: CataloguesService,
    private readonly photosService: PhotosService,
    private readonly clientSessionsService: ClientSessionsService
  ) {}

  @Get('/catalogue/:slug')
  @ApiOperation({ summary: 'Get public catalogue data by public URL slug' })
  @ApiParam({ name: 'slug', description: 'Public URL slug' })
  @ApiResponse({
    status: 200,
    description: 'Returns the catalogue',
    type: CataloguePublicResDto,
  })
  @ApiResponse({ status: 404, description: 'Catalogue not found' })
  async findBySlug(@Param('slug') slug: string) {
    const result = await this.cataloguesService.findPublicBySlug(slug);
    return new CataloguePublicResDto(result);
  }

  @Get('/catalogue/:slug/collection/:collectionId/photos')
  @ApiOperation({ summary: 'Get photos for a public collection' })
  @ApiParam({ name: 'slug', description: 'Public URL slug' })
  @ApiParam({ name: 'collectionId', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the photos',
    type: [CollectionPhotoPublicResDto],
  })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  async findCollectionPhotosBySlug(
    @Param('slug') slug: string,
    @Param('collectionId') collectionId: string
  ) {
    const result = await this.photosService.findPublicBySlugAndCollection(slug, collectionId);
    console.log('Controller result', result)
    return result.map(photo =>new CollectionPhotoPublicResDto(photo));
  }

  @Post('/catalogue/:slug/favourites')
  @ApiOperation({ summary: 'Add favourite photos for a client' })
  @ApiParam({ name: 'slug', description: 'Public URL slug' })
  @ApiBody({ type: AddFavouritesReqDtoClass })
  @ApiResponse({
    status: 201,
    description: 'Favourites added successfully',
    type: AddFavouritesResDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request payload' })
  @ApiResponse({ status: 404, description: 'Catalogue not found' })
  async addFavourites(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(addFavouritesSchema)) body: AddFavouritesReqDto
  ) {
    const result = await this.clientSessionsService.addFavourites(slug, body.email, body.photoIds);
    console.log('Add favourites result', result);
    return new AddFavouritesResDto(result?.email, true);
  }
}
