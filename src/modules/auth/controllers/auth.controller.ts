import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Redirect,
  Session,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';

interface SessionData {
  user?: {
    id: string;
    email: string;
    userName: string;
    displayName: string | null;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @Render('auth/login')
  loginForm() {
    return { title: 'Вход', error: null };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body() dto: LoginDto,
    @Session() session: SessionData,
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.validateUser(dto.email, dto.password);
      session.user = {
        id: user.id,
        email: user.email,
        userName: user.userName,
        displayName: user.displayName,
      };
      return res.redirect('/');
    } catch {
      return res.render('auth/login', {
        title: 'Вход',
        error: 'Неверный email или пароль',
      });
    }
  }

  @Post('logout')
  @Redirect('/auth/login')
  logout(@Session() session: SessionData) {
    return new Promise<void>((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).destroy(() => resolve());
    });
  }
}
