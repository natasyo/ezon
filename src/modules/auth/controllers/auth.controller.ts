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
  UseFilters,
} from '@nestjs/common';
import type { Response } from 'express';
import type { SessionData } from 'express-session';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { LoginValidationFilter } from '../filters/login-validation.filter.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @Render('auth/login')
  loginForm(@Session() session: SessionData) {
    const flash = session.loginFlash;
    delete session.loginFlash;
    return {
      title: 'Вход',
      error: flash?.error ?? null,
      errors: flash?.errors ?? {},
      old: flash?.old ?? { email: '' },
    };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(LoginValidationFilter)
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
      await new Promise<void>((resolve) =>
        (session as any).save(() => resolve()),
      );
      return res.redirect('/warehouse/products');
    } catch {
      session.loginFlash = {
        error: 'Неверный email или пароль',
        errors: {},
        old: { email: dto.email },
      };
      await new Promise<void>((resolve) =>
        (session as any).save(() => resolve()),
      );
      return res.redirect('/auth/login');
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
