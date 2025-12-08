import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(
    @Body() body: { email: string; password: string; name: string }
  ) {
    const user = await this.authService.registerUser(
      body.email,
      body.password,
      body.name
    );
    return { message: 'User registered successfully', user };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Req() req: Request) {
    return { message: 'Login successful', user: req.user };
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: Request) {
    req.logout((err) => {
      if (err) {
        throw err;
      }
    });
    return { message: 'Logout successful' };
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
    // Successful authentication, redirect to frontend
    return res.redirect('http://localhost:5173');
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  async getCurrentUser(@Req() req: Request) {
    return req.user;
  }

  @Get('status')
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({ status: 200, description: 'Returns authentication status' })
  async getStatus(@Req() req: Request) {
    return {
      isAuthenticated: req.isAuthenticated(),
      user: req.user || null,
    };
  }
}
