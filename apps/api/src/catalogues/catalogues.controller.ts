import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CataloguesService } from './catalogues.service';
import {
  CreateCatalogueDto,
  CreateCatalogueDtoClass,
  createCatalogueSchema,
} from './dto/create-catalogue.dto';
import {
  UpdateCatalogueDto,
  UpdateCatalogueDtoClass,
  updateCatalogueSchema,
} from './dto/update-catalogue.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { User } from '../common/auth/decorators/current-user.decorator';
import { UserEntity } from '../common/auth/interfaces/user-entity.interface';

@ApiTags('catalogues')
@Controller('catalogues')
export class CataloguesController {
  constructor(private readonly cataloguesService: CataloguesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new catalogue' })
  @ApiBody({ type: CreateCatalogueDtoClass })
  @ApiResponse({ status: 201, description: 'Catalogue created successfully' })
  @ApiResponse({ status: 409, description: 'URL slug already exists' })
  create(
    @Body(new ZodValidationPipe(createCatalogueSchema)) dto: CreateCatalogueDto,
    @User() user: UserEntity
  ) {
    return this.cataloguesService.create(dto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all catalogues for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all user catalogues' })
  findAll(@User() user: UserEntity) {
    return this.cataloguesService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a catalogue by ID' })
  @ApiParam({ name: 'id', description: 'Catalogue ID' })
  @ApiResponse({ status: 200, description: 'Returns the catalogue' })
  @ApiResponse({ status: 404, description: 'Catalogue not found' })
  findOne(@Param('id') id: string, @User() user: UserEntity) {
    return this.cataloguesService.findOne(id, user.id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a catalogue by public URL slug' })
  @ApiParam({ name: 'slug', description: 'Public URL slug' })
  @ApiResponse({ status: 200, description: 'Returns the catalogue' })
  @ApiResponse({ status: 404, description: 'Catalogue not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.cataloguesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a catalogue' })
  @ApiParam({ name: 'id', description: 'Catalogue ID' })
  @ApiBody({ type: UpdateCatalogueDtoClass })
  @ApiResponse({ status: 200, description: 'Catalogue updated successfully' })
  @ApiResponse({ status: 404, description: 'Catalogue not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCatalogueSchema)) dto: UpdateCatalogueDto,
    @User() user: UserEntity
  ) {
    return this.cataloguesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a catalogue' })
  @ApiParam({ name: 'id', description: 'Catalogue ID' })
  @ApiResponse({ status: 200, description: 'Catalogue deleted successfully' })
  @ApiResponse({ status: 404, description: 'Catalogue not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @User() user: UserEntity) {
    return this.cataloguesService.remove(id, user.id);
  }
}
