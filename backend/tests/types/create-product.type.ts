export interface CreateProductType {
  sku: string;
  ean?: string;
  asin?: string;
  name: string;
  categoryId?: string;
  condition?: string;
  purchasePrice?: number | string;
  salePrice?: number | string;
  cellId?: string;
  arrivalDate?: string;
  images?: string[];
  customFields?: Record<string, unknown>;
  showcaseStatuses?: Record<string, string>;
}
