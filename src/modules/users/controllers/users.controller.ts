import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Render,
  Res,
  UsePipes,
  ValidationPipe,
  UseFilters,
  ConflictException,
  Session,
} from '@nestjs/common';
import type { Response } from 'express';
import type { SessionData } from 'express-session';
import { UsersService } from '../services/users.service.js';
import { RegisterDto } from '../dto/register.dto.js';
import { ValidationRedirectFilter } from '../../../shared/guards/validation-redirect.filter.js';

@Controller('users')
@UseFilters(ValidationRedirectFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('register')
  @Render('auth/register')
  registerForm(
    @Session() session: SessionData,
    @Query('error') error?: string,
  ) {
    const flash = session.registerFlash;
    delete session.registerFlash;
    return {
      title: 'Регистрация',
      error: flash?.error ?? error ?? null,
      errors: flash?.errors ?? {},
      old: flash?.old ?? { userName: '', displayName: '', email: '' },
    };
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(
    @Body() dto: RegisterDto,
    @Session() session: SessionData,
    @Res() res: Response,
  ) {
    try {
      await this.usersService.create(dto);
      return res.redirect('/auth/login');
    } catch (e) {
      if (e instanceof ConflictException) {
        const errors = e.getResponse() as Record<string, string>;
        const firstError = Object.values(errors)[0] || 'Ошибка регистрации';
        session.registerFlash = {
          error: firstError,
          errors,
          old: {
            userName: dto.userName,
            displayName: dto.displayName,
            email: dto.email,
          },
        };
        await new Promise<void>((resolve) =>
          (session as any).save(() => resolve()),
        );
        return res.redirect('/users/register');
      }
      throw e;
    }
  }
}
