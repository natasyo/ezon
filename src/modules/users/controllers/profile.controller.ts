import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Session,
  Res,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../services/users.service.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';
import { ProfileDto } from '../dto/profile.dto.js';

@Controller('warehouse/profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('users/profile')
  async profileForm(@Session() session?: Record<string, any>) {
    const flash = session?.profileFlash;
    if (session) delete session.profileFlash;

    const user = await this.usersService.findById(session?.user?.id);
    return {
      title: 'Мой профиль',
      user: session?.user ?? null,
      employee: user,
      success: flash?.success ?? null,
      error: flash?.error ?? null,
      errors: flash?.errors ?? {},
    };
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateProfile(
    @Body() dto: ProfileDto,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const userId = session.user?.id;
    if (!userId) {
      return res.redirect('/auth/login');
    }

    try {
      const updated = await this.usersService.updateProfile(userId, dto);

      // Update session with new data
      session.user = {
        id: updated.id,
        email: updated.email,
        userName: updated.userName,
        displayName: updated.displayName,
      };

      session.profileFlash = { success: 'Профиль успешно обновлён' };
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    } catch (e) {
      if (e instanceof ConflictException) {
        const errors = e.getResponse() as Record<string, string>;
        const firstError =
          Object.values(errors)[0] || 'Ошибка при обновлении профиля';
        session.profileFlash = {
          error: firstError,
          errors,
        };
        await new Promise<void>((resolve) => session.save(() => resolve()));
        return res.redirect('/warehouse/profile');
      }
      // Ловим все остальные ошибки, чтобы избежать 500
      console.error('Profile update error:', e);
      session.profileFlash = {
        error: 'Ошибка при обновлении профиля',
      };
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    }
  }

  @Post('deactivate')
  async deactivate(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const userId = session.user?.id;
    if (!userId) {
      return res.redirect('/auth/login');
    }

    try {
      await this.usersService.deactivate(userId);

      // Destroy session and redirect to login
      return new Promise<void>((resolve) => {
        (session as any).destroy(() => {
          res.redirect('/auth/login?deactivated=1');
          resolve();
        });
      });
    } catch (e) {
      if (e instanceof NotFoundException) {
        session.profileFlash = { error: 'Пользователь не найден' };
      } else {
        console.error('Profile deactivate error:', e);
        session.profileFlash = { error: 'Ошибка при деактивации профиля' };
      }
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    }
  }

  @Post('reactivate')
  async reactivate(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const userId = session.user?.id;
    if (!userId) {
      return res.redirect('/auth/login');
    }

    try {
      await this.usersService.reactivate(userId);
      session.profileFlash = { success: 'Профиль успешно восстановлен' };
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    } catch (e) {
      if (e instanceof NotFoundException) {
        session.profileFlash = { error: 'Пользователь не найден' };
      } else {
        console.error('Profile reactivate error:', e);
        session.profileFlash = { error: 'Ошибка при восстановлении профиля' };
      }
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    }
  }
}
