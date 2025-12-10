import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CataloguesService } from '../catalogues/catalogues.service';
import { CataloguePublicResDto } from './dto/catalogue-public-res.dto';
import { PhotosService } from '../photos/photos.service';
import { CollectionPhotoPublicResDto } from './dto/collection-photo-public-res.dto';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly cataloguesService: CataloguesService,
    private readonly photosService: PhotosService
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


}
