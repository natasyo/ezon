import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ImportProductDto {
  @IsString()
  sku!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  ean?: string;

  @IsOptional()
  @IsString()
  asin?: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsString()
  cellName?: string;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsOptional()
  @IsString()
  customFields?: string;

  @IsOptional()
  @IsString()
  showcaseStatuses?: string;
}