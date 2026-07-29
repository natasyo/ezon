import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Преобразует пустую строку в undefined */
function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}

/** Преобразует строку цены в число */
function priceTransform({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    const num = Number(normalized);
    return Number.isFinite(num) ? num : undefined;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Наименование товара',
    example: 'Монитор LG 27"',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'ID категории товара',
    example: 'uuid-категории',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Состояние товара (Новый, Б/у, Бракованный)',
    example: 'Новый',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    description: 'Цена поступления. Допускаются запятая или точка.',
    example: 1500.50,
  })
  @IsOptional()
  @Transform(priceTransform)
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({
    description: 'Цена продажи. Допускаются запятая или точка.',
    example: 2500.00,
  })
  @IsOptional()
  @Transform(priceTransform)
  @IsNumber()
  salePrice?: number;

  @ApiPropertyOptional({
    description: 'ID ячейки хранения',
    example: 'uuid-ячейки',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  cellId?: string;

  @ApiPropertyOptional({
    description: 'EAN-13 штрихкод',
    example: '2001234567890',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  ean?: string;

  @ApiPropertyOptional({
    description: 'Amazon Standard Identification Number',
    example: 'B08N5WRWNW',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  asin?: string;

  @ApiPropertyOptional({
    description: 'URL-адреса фотографий',
    example: ['https://minio.example.com/photos/photo1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Произвольные поля (ключ-значение)',
    example: { вес: '2.5 кг' },
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Статусы на витринах',
    example: { main: 'VISIBLE' },
  })
  @IsOptional()
  @IsObject()
  showcaseStatuses?: Record<string, string>;
}
