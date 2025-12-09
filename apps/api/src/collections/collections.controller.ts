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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
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
import { CollectionResDto } from './dto/collection-res.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { User } from '../common/auth/decorators/current-user.decorator';
import { UserEntity } from '../common/auth/interfaces/user-entity.interface';

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
    const data = await this.collectionsService.findAll(catalogueId, user.id);
    return data.map(
      ({ collection, photoCount }) =>
        new CollectionResDto({ collection, photoCount })
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
    return new CollectionResDto({ collection: data.collection, photoCount: data.photoCount });
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
}
