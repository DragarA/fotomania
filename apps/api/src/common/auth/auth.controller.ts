import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

import { AuthService } from './auth.service';
import { User } from './decorators/current-user.decorator';
import {
    AuthLoginDto,
    AuthLoginDtoClass,
    authLoginSchema,
} from './dto/auth-login.dto';
import {
    AuthExchangeDto,
    AuthExchangeDtoClass,
    authExchangeSchema,
} from './dto/auth-exchange.dto';
import {
    AuthRefreshDto,
    AuthRefreshDtoClass,
    authRefreshSchema,
} from './dto/auth-refresh.dto';
import {
    AuthRegisterDto,
    AuthRegisterDtoClass,
    authRegisterSchema,
} from './dto/auth-register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserEntity } from './interfaces/user-entity.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: AuthRegisterDtoClass })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    async register(
        @Body(new ZodValidationPipe(authRegisterSchema)) dto: AuthRegisterDto
    ) {
        const user = await this.authService.registerUser(
            dto.email,
            dto.password,
            dto.name
        );
        const tokens = await this.authService.login(user);
        return {
            message: 'User registered successfully',
            ...tokens,
        };
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({ type: AuthLoginDtoClass })
    @ApiResponse({ status: 200, description: 'Login successful' })
    async login(
        @Req() req: Request,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body(new ZodValidationPipe(authLoginSchema)) dto: AuthLoginDto
    ) {
        const tokens = await this.authService.login(req.user);
        return {
            message: 'Login successful',
            ...tokens,
        };
    }

    @Post('logout')
    @HttpCode(200)
    @ApiOperation({ summary: 'Logout current user (client-side with JWT)' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout() {
        // With JWT, logout is handled client-side by removing the token
        return {
            message:
                'Logout successful. Please remove the token from client storage.',
        };
    }

    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiBody({ type: AuthRefreshDtoClass })
    @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refresh(
        @Body(new ZodValidationPipe(authRefreshSchema)) dto: AuthRefreshDto
    ) {
        const tokens = await this.authService.refreshAccessToken(
            dto.refreshToken
        );
        return {
            message: 'Tokens refreshed successfully',
            ...tokens,
        };
    }

    @Post('exchange')
    @HttpCode(200)
    @ApiOperation({ summary: 'Exchange OAuth code for tokens' })
    @ApiBody({ type: AuthExchangeDtoClass })
    @ApiResponse({ status: 200, description: 'Tokens exchanged successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired OAuth code' })
    async exchange(
        @Body(new ZodValidationPipe(authExchangeSchema)) dto: AuthExchangeDto
    ) {
        const tokens = this.authService.consumeOauthExchangeCode(dto.code);
        return {
            message: 'Tokens exchanged successfully',
            ...tokens,
        };
    }

    @UseGuards(GoogleAuthGuard)
    @Get('google')
    @ApiOperation({ summary: 'Initiate Google OAuth login' })
    async googleAuth() {
        // Guard redirects to Google
    }

    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    @ApiOperation({ summary: 'Google OAuth callback' })
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        // Generate JWT for the authenticated user
        const tokens = await this.authService.login(req.user);

        // Redirect to frontend with a short-lived exchange code
        const frontendBaseUrl =
            this.configService.get<string>('FRONTEND_URL') ||
            'http://localhost:5173';
        const code = this.authService.createOauthExchangeCode(tokens);
        const frontendUrl = `${frontendBaseUrl}/auth/callback?code=${code}`;
        return res.redirect(frontendUrl);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('me')
    @ApiOperation({ summary: 'Get current user' })
    @ApiResponse({ status: 200, description: 'Returns current user' })
    async getCurrentUser(@User() user: UserEntity) {
        return user;
    }
}
