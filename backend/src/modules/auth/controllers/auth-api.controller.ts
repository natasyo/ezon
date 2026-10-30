import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Session,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import type { SessionData } from 'express-session';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterDto } from '../../users/dto/register.dto.js';
import { UsersService } from '../../users/services/users.service.js';

@Controller('api/auth')
export class AuthApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('session')
  session(@Session() session: SessionData) {
    return { user: session.user ?? null };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => (error ? reject(error) : resolve()));
    });
    req.session.user = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      displayName: user.displayName,
    };
    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()));
    });
    return { user: req.session.user };
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return { user };
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    if (!req.session) throw new UnauthorizedException();
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => (error ? reject(error) : resolve()));
    });
    return { success: true };
  }
}
