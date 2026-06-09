import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCellDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name?: string;
}
