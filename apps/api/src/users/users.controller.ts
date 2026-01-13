import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { User } from '../common/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { UserEntity } from '../common/auth/interfaces/user-entity.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import {
    UpdateUserDto,
    UpdateUserDtoClass,
    updateUserSchema,
} from './dto/update-user.dto';
import { UserResDto } from './dto/user-res.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
        status: 200,
        description: 'Returns the current user profile',
        type: UserResDto,
    })
    async getMe(@User() user: UserEntity) {
        const fullUser = await this.usersService.findOne(user.id);
        return new UserResDto(fullUser);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiBody({ type: UpdateUserDtoClass })
    @ApiResponse({
        status: 200,
        description: 'User profile updated successfully',
        type: UserResDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    async updateMe(
        @User() user: UserEntity,
        @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto
    ) {
        const updatedUser = await this.usersService.update(user.id, dto);
        return new UserResDto(updatedUser);
    }
}
