import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Match } from '../../../shared/decorators/match.decorator.js';

export class ProfileDto {
  @IsOptional()
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @MinLength(3, { message: 'Имя пользователя должно быть не менее 3 символов' })
  @MaxLength(30)
  userName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;

  @ValidateIf(
    (o) =>
      (o.password && o.password !== '') ||
      (o.confirmPassword && o.confirmPassword !== ''),
  )
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(100)
  password?: string;

  @ValidateIf(
    (o) =>
      (o.confirmPassword && o.confirmPassword !== '') ||
      (o.password && o.password !== ''),
  )
  @IsString()
  @Match('password', { message: 'Пароли не совпадают' })
  confirmPassword?: string;
}
