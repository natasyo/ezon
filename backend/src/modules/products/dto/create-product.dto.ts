import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Преобразует пустую строку в undefined, иначе возвращает значение */
function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}

/** Преобразует строку цены (с запятой или точкой) в число или undefined */
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

export class CreateProductDto {
  @ApiProperty({
    description: 'Артикул товара (SKU). Уникальный идентификатор.',
    example: 'SKU-001',
  })
  @IsString()
  sku!: string;

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

  @ApiProperty({
    description: 'Наименование товара',
    example: 'Монитор LG 27"',
  })
  @IsString()
  name!: string;

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
    description: 'Цена поступления (закупочная). Допускаются запятая или точка как разделитель.',
    example: 1500.50,
  })
  @IsOptional()
  @Transform(priceTransform)
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({
    description: 'Цена продажи. Допускаются запятая или точка как разделитель.',
    example: 2500.00,
  })
  @IsOptional()
  @Transform(priceTransform)
  @IsNumber()
  salePrice?: number;

  @ApiPropertyOptional({
    description: 'ID ячейки хранения на складе',
    example: 'uuid-ячейки',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  cellId?: string;

  @ApiPropertyOptional({
    description: 'Дата поступления на склад (YYYY-MM-DD)',
    example: '2025-03-20',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  arrivalDate?: string;

  @ApiPropertyOptional({
    description: 'URL-адреса загруженных фотографий',
    example: ['https://minio.example.com/photos/photo1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Произвольные поля товара (ключ-значение)',
    example: { вес: '2.5 кг', цвет: 'чёрный' },
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Статусы отображения на витринах',
    example: { main: 'VISIBLE', outlet: 'HIDDEN' },
  })
  @IsOptional()
  @IsObject()
  showcaseStatuses?: Record<string, string>;
}
