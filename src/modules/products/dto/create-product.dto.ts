import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  ean?: string;

  @IsOptional()
  @IsString()
  asin?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      const normalized = value.replace(',', '.').trim();
      const num = Number(normalized);
      return Number.isFinite(num) ? num : undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      const normalized = value.replace(',', '.').trim();
      const num = Number(normalized);
      return Number.isFinite(num) ? num : undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsString()
  cellId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  @IsDateString()
  arrivalDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  showcaseStatuses?: Record<string, string>;
}
