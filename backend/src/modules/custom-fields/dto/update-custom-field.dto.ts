import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCustomFieldDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  key?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
