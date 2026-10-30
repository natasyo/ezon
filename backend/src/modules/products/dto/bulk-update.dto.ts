import { IsArray, IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class BulkUpdateDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];

  @IsOptional()
  @Transform(({ value }) => {
    // Пустое значение не учитываем
    if (value === '' || value === null || value === undefined) return undefined;
    // Разрешаем ввод с запятой и пробелами
    if (typeof value === 'string') {
      const normalized = value.replace(',', '.').trim();
      const num = Number(normalized);
      return Number.isFinite(num) ? num : undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  })
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
