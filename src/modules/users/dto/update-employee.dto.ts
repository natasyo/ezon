import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Match } from '../../../shared/decorators/match.decorator.js';
import { UserRole } from '@prisma/client';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(100)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Match('password', { message: 'Пароли не совпадают' })
  confirmPassword?: string;

  @IsOptional()
  @IsString({ message: 'Имя пользователя обязательно' })
  @MinLength(3, { message: 'Имя пользователя должно быть не менее 3 символов' })
  @MaxLength(30)
  userName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Некорректная роль' })
  role?: UserRole;
}
