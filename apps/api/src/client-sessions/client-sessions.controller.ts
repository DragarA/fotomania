import {
    Controller,
    Get,
    Param,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { User } from '../common/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { UserEntity } from '../common/auth/interfaces/user-entity.interface';
import { ClientSessionsService } from './client-sessions.service';
import { ClientSessionFavouritesResDto } from './dto/client-session-favourite.dto';

@ApiTags('client-sessions')
@Controller('client-sessions')
export class ClientSessionsController {
  constructor(private readonly clientSessionsService: ClientSessionsService) {}

  @Get(':catalogueId/favourites/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all client favourites for a catalogue' })
  @ApiParam({ name: 'catalogueId', description: 'Catalogue ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all client sessions with their favourites',
    type: ClientSessionFavouritesResDto,
  })
  @ApiResponse({ status: 404, description: 'Catalogue not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCatalogueFavourites(
    @Param('catalogueId') catalogueId: string,
    @Param('sessionId') sessionId: string,
    @User() user: UserEntity
  ) {
    const result = await this.clientSessionsService.getFavouritesBySession(sessionId, catalogueId, user.id)
    return new ClientSessionFavouritesResDto(result);
  }
}
