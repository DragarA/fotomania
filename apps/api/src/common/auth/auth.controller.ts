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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { User } from './decorators/current-user.decorator';
import { UserEntity } from './interfaces/user-entity.interface';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  AuthRegisterDto,
  AuthRegisterDtoClass,
  authRegisterSchema,
} from './dto/auth-register.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { AuthLoginDto, AuthLoginDtoClass, authLoginSchema } from './dto/auth-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

    // Redirect to frontend with tokens as query params
    // In production, you might want to use a more secure method
    const frontendUrl = `http://localhost:5173/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
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
