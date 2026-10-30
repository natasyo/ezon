export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface SessionUser {
  id: string;
  email: string;
  userName: string;
  displayName: string | null;
  role?: UserRole;
}

export interface Product {
  id: string;
  sku: string;
  ean: string | null;
  asin: string | null;
  name: string;
  condition: string | null;
  purchasePrice: string | number;
  salePrice: string | number;
  status: string;
  cellId: string | null;
  categoryId: string | null;
  arrivalDate: string | null;
  images: string[];
  customFields: Record<string, unknown> | null;
  showcaseStatuses: Record<string, string> | null;
  cell?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResult {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Cell {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface CustomField {
  id: string;
  key: string;
  label: string;
  type: string;
  categoryId: string;
  category?: { id: string; name: string } | null;
}

export interface Employee {
  id: string;
  email: string;
  userName: string;
  displayName: string | null;
  role: UserRole;
  isDeactivated: boolean;
  createdAt: string;
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
}

export interface ProductImportReport {
  created: number;
  skipped: number;
  errors: string[];
}

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  ARRIVAL: 'Поступление',
  IN_STOCK: 'На складе',
  PLACED: 'Размещён',
  SOLD: 'Продан',
  WRITTEN_OFF: 'Списан',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  EMPLOYEE: 'Сотрудник',
};

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const message = (data as Record<string, unknown>).message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
    if (message && typeof message === 'object') {
      const values = Object.values(message as Record<string, unknown>);
      return values.length ? values.join('. ') : fallback;
    }
  }
  return fallback;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // тело не JSON — оставляем null
    }
    throw new Error(extractMessage(payload, 'Не удалось выполнить запрос'));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function apiForm<T>(
  path: string,
  body: FormData,
  method: 'POST' | 'PATCH' = 'POST',
): Promise<T> {
  return api<T>(path, { method, body });
}

export function productStatusLabel(status: string): string {
  return PRODUCT_STATUS_LABELS[status] ?? status;
}
