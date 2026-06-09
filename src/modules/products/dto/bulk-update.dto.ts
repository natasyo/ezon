import { IsArray, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUpdateDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  cellId?: string;
}
