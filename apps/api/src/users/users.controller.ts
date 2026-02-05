import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
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
import {
    LOGO_MAX_SIZE,
    logoFileFilter,
    logoStorage,
} from './multer-logo.config';
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
        @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto,
    ) {
        const updatedUser = await this.usersService.update(user.id, dto);
        return new UserResDto(updatedUser);
    }

    @Post('me/logo')
    @ApiOperation({ summary: 'Upload user logo' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Logo uploaded successfully',
        type: UserResDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid file' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: logoStorage,
            fileFilter: logoFileFilter,
            limits: { fileSize: LOGO_MAX_SIZE },
        }),
    )
    async uploadLogo(
        @User() user: UserEntity,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const updatedUser = await this.usersService.uploadLogo(user.id, file);
        return new UserResDto(updatedUser);
    }

    @Delete('me/logo')
    @ApiOperation({ summary: 'Remove user logo' })
    @ApiResponse({
        status: 200,
        description: 'Logo removed successfully',
        type: UserResDto,
    })
    async removeLogo(@User() user: UserEntity) {
        const updatedUser = await this.usersService.removeLogo(user.id);
        return new UserResDto(updatedUser);
    }
}
