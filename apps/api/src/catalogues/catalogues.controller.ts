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

import { User } from '../common/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { UserEntity } from '../common/auth/interfaces/user-entity.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { CataloguesService } from './catalogues.service';
import { CatalogueResDto } from './dto/catalogue-res.dto';
import { ClientFavouritesResDto } from './dto/client-favourites-res.dto';
import {
    CreateCatalogueDto,
    CreateCatalogueDtoClass,
    createCatalogueSchema,
} from './dto/create-catalogue.dto';
import {
    UpdateCatalogueStatusDto,
    UpdateCatalogueStatusDtoClass,
    updateCatalogueStatusSchema,
} from './dto/update-catalogue-status.dto';
import {
    UpdateCatalogueDto,
    UpdateCatalogueDtoClass,
    updateCatalogueSchema,
} from './dto/update-catalogue.dto';

@ApiTags('catalogues')
@Controller('catalogues')
export class CataloguesController {
    constructor(private readonly cataloguesService: CataloguesService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a new catalogue' })
    @ApiBody({ type: CreateCatalogueDtoClass })
    @ApiResponse({
        status: 201,
        description: 'Catalogue created successfully',
        type: CatalogueResDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    create(
        @Body(new ZodValidationPipe(createCatalogueSchema))
        dto: CreateCatalogueDto,
        @User() user: UserEntity
    ) {
        return this.cataloguesService.create(dto, user.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all catalogues for the current user' })
    @ApiResponse({
        status: 200,
        description: 'Returns all user catalogues',
        type: [CatalogueResDto],
    })
    async findAll(@User() user: UserEntity) {
        const data = await this.cataloguesService.findAll(user.id);
        return data.map(
            ({ catalogue, photoCount }) =>
                new CatalogueResDto({ catalogue, photoCount })
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get a catalogue by ID' })
    @ApiParam({ name: 'id', description: 'Catalogue ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns the catalogue',
        type: CatalogueResDto,
    })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    async findOne(@Param('id') id: string, @User() user: UserEntity) {
        const catalogue = await this.cataloguesService.findOne(id, user.id);
        return new CatalogueResDto({ catalogue });
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a catalogue' })
    @ApiParam({ name: 'id', description: 'Catalogue ID' })
    @ApiBody({ type: UpdateCatalogueDtoClass })
    @ApiResponse({
        status: 200,
        description: 'Catalogue updated successfully',
        type: CatalogueResDto,
    })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(updateCatalogueSchema))
        dto: UpdateCatalogueDto,
        @User() user: UserEntity
    ) {
        const catalogue = await this.cataloguesService.update(id, dto, user.id);
        return new CatalogueResDto({ catalogue });
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a catalogue status' })
    @ApiParam({ name: 'id', description: 'Catalogue ID' })
    @ApiBody({ type: UpdateCatalogueStatusDtoClass })
    @ApiResponse({
        status: 200,
        description: 'Catalogue updated successfully',
        type: CatalogueResDto,
    })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async updateStatus(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(updateCatalogueStatusSchema))
        dto: UpdateCatalogueStatusDto,
        @User() user: UserEntity
    ) {
        const catalogue = await this.cataloguesService.updateStatus(
            id,
            dto,
            user.id
        );
        return new CatalogueResDto({ catalogue });
    }

    @Patch(':catalogueId/cover/:photoId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Set a photo as catalogue cover' })
    @ApiParam({ name: 'catalogueId', description: 'Catalogue ID' })
    @ApiParam({ name: 'photoId', description: 'Photo ID to set as cover' })
    @ApiResponse({
        status: 200,
        description: 'Cover updated',
        type: CatalogueResDto,
    })
    @ApiResponse({ status: 404, description: 'Catalogue or photo not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    setCover(
        @Param('catalogueId') catalogueId: string,
        @Param('photoId') photoId: string,
        @User() user: UserEntity
    ) {
        return this.cataloguesService.setCover(catalogueId, photoId, user.id);
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

    @Get(':catalogueId/favourites')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all client favourites for a catalogue' })
    @ApiParam({ name: 'catalogueId', description: 'Catalogue ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns all client sessions with their favourites',
        type: [ClientFavouritesResDto],
    })
    @ApiResponse({ status: 404, description: 'Catalogue not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getCatalogueFavourites(
        @Param('catalogueId') catalogueId: string,
        @User() user: UserEntity
    ) {
        return this.cataloguesService.getCatalogueFavourites(
            catalogueId,
            user.id
        );
    }
}
