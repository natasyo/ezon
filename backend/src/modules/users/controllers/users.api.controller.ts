import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service.js';
import { RegisterDto } from '../dto/register.dto.js';

@Controller('api/users')
export class UsersApiController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterDto, description: 'Данные для регистрации' })
  @ApiCreatedResponse({ description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email или имя пользователя уже заняты',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.usersService.create(dto);
    } catch (e) {
      if (e instanceof ConflictException) {
        const errors = e.getResponse();
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message: errors,
          error: 'Conflict',
        });
      }
      throw e;
    }
  }
}
