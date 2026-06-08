import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Render,
  Redirect,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Session,
} from '@nestjs/common';
import { UsersService } from '../services/users.service.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';

@Controller('warehouse/users')
@UseGuards(AuthGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('users/list')
  async list(@Session() session?: Record<string, any>) {
    const users = await this.usersService.findAll();
    return {
      title: 'Сотрудники',
      user: session?.user ?? null,
      users,
    };
  }

  @Get(':id/edit')
  @Render('users/edit')
  async editForm(
    @Param('id') id: string,
    @Session() session?: Record<string, any>,
  ) {
    const employee = await this.usersService.findById(id);
    return {
      title: `Редактировать: ${employee?.displayName || employee?.userName}`,
      user: session?.user ?? null,
      employee,
    };
  }

  @Post(':id')
  @Redirect('/warehouse/users')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() body: Record<string, string>) {
    await this.usersService.updateUser(id, {
      email: body.email,
      userName: body.userName,
      displayName: body.displayName,
      role: body.role,
    });
    return {};
  }

  @Post(':id/deactivate')
  @Redirect('/warehouse/users')
  async deactivate(@Param('id') id: string) {
    await this.usersService.deactivate(id);
    return {};
  }

  @Post(':id/reactivate')
  @Redirect('/warehouse/users')
  async reactivate(@Param('id') id: string) {
    await this.usersService.reactivate(id);
    return {};
  }
}
