import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Render,
  Redirect,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Session,
  Res,
  ConflictException,
  UseFilters,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../services/users.service.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';
import { CreateEmployeeDto } from '../dto/create-employee.dto.js';
import { UpdateEmployeeDto } from '../dto/update-employee.dto.js';
import { AdminValidationFilter } from '../filters/admin-validation.filter.js';

@Controller('warehouse/users')
@UseGuards(AuthGuard)
@UseFilters(AdminValidationFilter)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('users/list')
  async list(
    @Query('search') search?: string,
    @Session() session?: Record<string, any>,
  ) {
    const flash = session?.employeeFlash;
    if (session) delete session.employeeFlash;

    const users = await this.usersService.findAll(search);
    return {
      title: 'Сотрудники',
      user: session?.user ?? null,
      users,
      search: search ?? '',
      success: flash?.success ?? null,
    };
  }

  @Get('create')
  @Render('users/create')
  createForm(@Session() session?: Record<string, any>) {
    const flash = session?.employeeFlash;
    if (session) delete session.employeeFlash;

    return {
      title: 'Добавить сотрудника',
      user: session?.user ?? null,
      error: flash?.error ?? null,
      errors: flash?.errors ?? {},
      old: flash?.old ?? {
        userName: '',
        displayName: '',
        email: '',
        role: 'EMPLOYEE',
      },
    };
  }

  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() dto: CreateEmployeeDto,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      await this.usersService.createEmployee(dto);
      session.employeeFlash = { success: 'Сотрудник успешно добавлен' };
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/users');
    } catch (e) {
      if (e instanceof ConflictException) {
        const errors = e.getResponse() as Record<string, string>;
        const firstError =
          Object.values(errors)[0] || 'Ошибка при создании сотрудника';
        session.employeeFlash = {
          error: firstError,
          errors,
          old: {
            userName: dto.userName,
            displayName: dto.displayName,
            email: dto.email,
            role: dto.role ?? 'EMPLOYEE',
          },
        };
        await new Promise<void>((resolve) => session.save(() => resolve()));
        return res.redirect('/warehouse/users/create');
      }
      throw e;
    }
  }

  @Get(':id/edit')
  @Render('users/edit')
  async editForm(
    @Param('id') id: string,
    @Session() session?: Record<string, any>,
  ) {
    const flash = session?.employeeFlash;
    if (session) delete session.employeeFlash;

    const employee = await this.usersService.findById(id);
    return {
      title: `Редактировать: ${employee?.displayName || employee?.userName}`,
      user: session?.user ?? null,
      employee,
      success: flash?.success ?? null,
      error: flash?.error ?? null,
      errors: flash?.errors ?? {},
    };
  }

  @Post(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      await this.usersService.updateUser(id, dto);
      session.employeeFlash = { success: 'Сотрудник успешно обновлён' };
      await new Promise<void>((resolve) => session.save(() => resolve()));
      return res.redirect('/warehouse/users');
    } catch (e) {
      if (e instanceof ConflictException) {
        const errors = e.getResponse() as Record<string, string>;
        const firstError =
          Object.values(errors)[0] || 'Ошибка при обновлении сотрудника';
        session.employeeFlash = { error: firstError, errors };
        await new Promise<void>((resolve) => session.save(() => resolve()));
        return res.redirect(`/warehouse/users/${id}/edit`);
      }
      throw e;
    }
  }

  @Post(':id/deactivate')
  @Redirect('/warehouse/users')
  async deactivate(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
  ) {
    await this.usersService.deactivate(id);
    session.employeeFlash = { success: 'Сотрудник деактивирован' };
    return {};
  }

  @Post(':id/reactivate')
  @Redirect('/warehouse/users')
  async reactivate(
    @Param('id') id: string,
    @Session() session: Record<string, any>,
  ) {
    await this.usersService.reactivate(id);
    session.employeeFlash = { success: 'Сотрудник активирован' };
    return {};
  }
}
