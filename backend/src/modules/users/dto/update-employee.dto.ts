import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Match } from '../../../shared/decorators/match.decorator.js';
import { UserRole } from '@prisma/client';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Email сотрудника',
    example: 'employee@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Новый пароль (минимум 6 символов)',
    example: 'newpassword123',
    minLength: 6,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(100)
  password?: string;

  @ApiPropertyOptional({
    description: 'Подтверждение нового пароля',
    example: 'newpassword123',
    minLength: 6,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Match('password', { message: 'Пароли не совпадают' })
  confirmPassword?: string;

  @ApiPropertyOptional({
    description: 'Уникальное имя пользователя (логин)',
    example: 'ivanov',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Имя пользователя обязательно' })
  @MinLength(3, { message: 'Имя пользователя должно быть не менее 3 символов' })
  @MaxLength(30)
  userName?: string;

  @ApiPropertyOptional({
    description: 'Отображаемое имя',
    example: 'Иван Иванов',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Роль сотрудника',
    example: 'MANAGER',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Некорректная роль' })
  role?: UserRole;
}
