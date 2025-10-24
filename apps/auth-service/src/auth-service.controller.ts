import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { AuthServiceService } from './auth-service.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard, CurrentUser } from '@app/auth';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.validateUser(user.userId);
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/callback?token=${result.access_token}`);
  }

  // GitHub OAuth
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/callback?token=${result.access_token}`);
  }

  // Microservice message patterns
  @MessagePattern({ cmd: 'validate_user' })
  async validateUser(data: { userId: string }) {
    return this.authService.validateUser(data.userId);
  }
}
