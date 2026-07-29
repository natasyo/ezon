/**
 * Фиксированные колонки манифеста паллеты.
 * Порядок и состав строго заданы — любое несовпадение = ошибка.
 */

export const PALLET_MANIFEST_COLUMNS = [
  'sku',
  'name',
  'ean',
  'asin',
  'categoryName',
  'condition',
  'purchasePrice',
  'salePrice',
  'cellName',
  'arrivalDate',
  'images',
  'customFields',
  'showcaseStatuses',
] as const;

export type PalletManifestColumn = (typeof PALLET_MANIFEST_COLUMNS)[number];

export interface PalletManifestRow {
  rowNumber: number; // 2-based (строка 1 = заголовок)
  values: Record<string, string>;
}

export interface PalletImportError {
  rowNumber: number;
  sku: string;
  reason: string;
}

export interface PalletImportReport {
  total: number;
  created: number;
  skippedDuplicates: number;
  rejected: number;
  errors: PalletImportError[];
  csvReportPath?: string;
}
