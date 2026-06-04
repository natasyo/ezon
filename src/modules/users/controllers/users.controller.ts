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
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../services/users.service.js';
import { RegisterDto } from '../dto/register.dto.js';
import { ValidationRedirectFilter } from '../../../shared/guards/validation-redirect.filter.js';

@Controller('users')
@UseFilters(ValidationRedirectFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('register')
  @Render('auth/register')
  registerForm(@Query('error') error?: string) {
    return { title: 'Регистрация', error: error || null };
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    await this.usersService.create(dto);
    return res.redirect('/auth/login');
  }
}
