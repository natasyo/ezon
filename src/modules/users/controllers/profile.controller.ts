import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Render,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseFilters,
  Session,
  Res,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiExcludeEndpoint, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';
import { ProfileDto } from '../dto/profile.dto.js';
import { ProfileValidationFilter } from '../filters/profile-validation.filter.js';
import { PrismaService } from '../../../tools/prisma/prisma.service.js';

@Controller('warehouse/profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @ApiExcludeEndpoint()
  @Render('users/profile')
  async profileForm(@Session() session?: Record<string, any>) {
    const flash = session?.profileFlash;
    if (session) delete session.profileFlash;
    const user = await this.usersService.findById(session?.user?.id);
    return {
      title: 'Мой профиль', user: session?.user ?? null, employee: user,
      success: flash?.success ?? null, error: flash?.error ?? null, errors: flash?.errors ?? {},
    };
  }

  @Post()
  @ApiBody({ type: ProfileDto, description: 'Данные профиля' })
  @ApiOkResponse({ description: 'Профиль обновлён' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseFilters(ProfileValidationFilter)
  async updateProfile(
    @Body() dto: ProfileDto,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const userId = session.user?.id;
    if (!userId) return res.redirect('/auth/login');
    try {
      const updated = await this.usersService.updateProfile(userId, dto);
      session.user = { id: updated.id, email: updated.email, userName: updated.userName, displayName: updated.displayName };
      session.profileFlash = { success: 'Профиль успешно обновлён' };
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    } catch (e) {
      if (e instanceof ConflictException) {
        const response = e.getResponse() as Record<string, unknown>;
        const fieldErrors: Record<string, string> = {};
        for (const [key, value] of Object.entries(response)) {
          if (key !== 'error' && key !== 'statusCode' && key !== 'message' && typeof value === 'string') {
            fieldErrors[key] = value;
          }
        }
        session.profileFlash = { error: null, errors: fieldErrors };
      } else {
        console.error('Profile update error:', e);
        session.profileFlash = { error: 'Ошибка при обновлении профиля' };
      }
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    }
  }

  @Post('deactivate')
  @ApiExcludeEndpoint()
  async deactivate(@Req() req: Request, @Session() session: Record<string, any>, @Res() res: Response) {
    const userId = session.user?.id;
    if (!userId) return res.redirect('/auth/login');
    try {
      await this.usersService.deactivate(userId);
      const sid = req.sessionID;
      if (sid) await this.prismaService.$executeRawUnsafe('DELETE FROM "user_sessions" WHERE sid = $1', sid);
      return new Promise<void>((resolve) => { (session as any).destroy(() => { res.redirect('/auth/login?deactivated=1'); resolve(); }); });
    } catch (e) {
      if (e instanceof NotFoundException) session.profileFlash = { error: 'Пользователь не найден' };
      else { console.error('Profile deactivate error:', e); session.profileFlash = { error: 'Ошибка при деактивации профиля' }; }
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    }
  }

  @Post('reactivate')
  @ApiExcludeEndpoint()
  async reactivate(@Session() session: Record<string, any>, @Res() res: Response) {
    const userId = session.user?.id;
    if (!userId) return res.redirect('/auth/login');
    try {
      await this.usersService.reactivate(userId);
      session.profileFlash = { success: 'Профиль успешно восстановлен' };
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    } catch (e) {
      if (e instanceof NotFoundException) session.profileFlash = { error: 'Пользователь не найден' };
      else { console.error('Profile reactivate error:', e); session.profileFlash = { error: 'Ошибка при восстановлении профиля' }; }
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/profile');
    }
  }
}
