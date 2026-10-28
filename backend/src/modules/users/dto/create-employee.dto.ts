import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Match } from '../../../shared/decorators/match.decorator.js';
import { UserRole } from '@prisma/client';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Email сотрудника',
    example: 'employee@example.com',
  })
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;

  @ApiProperty({
    description: 'Пароль (минимум 6 символов)',
    example: 'password123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(100)
  password!: string;

  @ApiProperty({
    description: 'Подтверждение пароля',
    example: 'password123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Match('password', { message: 'Пароли не совпадают' })
  confirmPassword!: string;

  @ApiProperty({
    description: 'Уникальное имя пользователя (логин)',
    example: 'ivanov',
    minLength: 3,
    maxLength: 30,
  })
  @IsString({ message: 'Имя пользователя обязательно' })
  @MinLength(3, { message: 'Имя пользователя должно быть не менее 3 символов' })
  @MaxLength(30)
  userName!: string;

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
    example: 'EMPLOYEE',
    enum: UserRole,
    default: 'EMPLOYEE',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Некорректная роль' })
  role?: UserRole;
}
