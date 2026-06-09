import { IsString, MinLength } from 'class-validator';

export class CreateCustomFieldDto {
  @IsString()
  @MinLength(1)
  key!: string;

  @IsString()
  label!: string;

  @IsString()
  type!: string;

  @IsString()
  categoryId!: string;
}
