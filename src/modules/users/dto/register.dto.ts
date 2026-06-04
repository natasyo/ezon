import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Match } from '../../../shared/decorators/match.decorator.js';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Match('password', { message: 'Пароли не совпадают' })
  confirmPassword!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  userName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
