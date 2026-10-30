'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  api,
  apiForm,
  Category,
  Cell,
  Product,
  ProductImportReport,
  ProductListResult,
  productStatusLabel,
  PRODUCT_STATUS_LABELS,
} from '@/lib/api';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_LABELS);

interface Filters {
  search: string;
  status: string;
  categoryId: string;
  cellId: string;
}

function parseKeyValueLines(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  }
  return result;
}

export default function CatalogSection() {
  const [result, setResult] = useState<ProductListResult>({ data: [], total: 0, page: 1, pageSize: PAGE_SIZE });
  const [filters, setFilters] = useState<Filters>({ search: '', status: '', categoryId: '', cellId: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importReport, setImportReport] = useState<ProductImportReport | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  async function load(page = result.page, nextFilters = filters) {
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (nextFilters.search) query.set('search', nextFilters.search);
    if (nextFilters.status) query.set('status', nextFilters.status);
    if (nextFilters.categoryId) query.set('categoryId', nextFilters.categoryId);
    if (nextFilters.cellId) query.set('cellId', nextFilters.cellId);
    try {
      const data = await api<ProductListResult>(`/api/products?${query}`);
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1, filters);
    void Promise.all([api<Category[]>('/api/categories'), api<Cell[]>('/api/cells')])
      .then(([cats, cellsData]) => {
        setCategories(cats);
        setCells(cellsData);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFilters(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    void load(1, next);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function buildProductPayload(form: FormData): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      sku: String(form.get('sku') ?? '').trim(),
      name: String(form.get('name') ?? '').trim(),
    };
    const optional = (key: string) => {
      const value = String(form.get(key) ?? '').trim();
      if (value) payload[key] = value;
    };
    optional('ean');
    optional('asin');
    optional('condition');
    optional('categoryId');
    optional('cellId');
    optional('arrivalDate');
    const purchase = String(form.get('purchasePrice') ?? '').trim();
    const sale = String(form.get('salePrice') ?? '').trim();
    if (purchase) payload.purchasePrice = Number(purchase.replace(',', '.'));
    if (sale) payload.salePrice = Number(sale.replace(',', '.'));
    const images = String(form.get('images') ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (editing) {
      payload.images = images;
    } else if (images.length) {
      payload.images = images;
    }
    const customFields = parseKeyValueLines(String(form.get('customFields') ?? ''));
    if (Object.keys(customFields).length) payload.customFields = customFields;
    return payload;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setSuccess('');
    const form = new FormData(event.currentTarget);
    const payload = buildProductPayload(form);
    try {
      if (editing) {
        await api(`/api/products/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSuccess('Товар обновлён');
      } else {
        await api('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSuccess('Товар создан');
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function transition(product: Product) {
    try {
      await api(`/api/products/${product.id}/transition`, { method: 'POST' });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(product: Product) {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return;
    try {
      await api(`/api/products/${product.id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function bulkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected.size === 0) {
      setError('Выберите товары для массового обновления');
      return;
    }
    setPending(true);
    setError('');
    setSuccess('');
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = { ids: [...selected] };
    const price = String(form.get('price') ?? '').trim();
    const status = String(form.get('status') ?? '').trim();
    const categoryId = String(form.get('categoryId') ?? '').trim();
    const cellId = String(form.get('cellId') ?? '').trim();
    if (price) payload.price = Number(price.replace(',', '.'));
    if (status) payload.status = status;
    if (categoryId) payload.categoryId = categoryId;
    if (cellId) payload.cellId = cellId;
    try {
      await api('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSelected(new Set());
      setSuccess('Товары обновлены');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function importSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = importInput.current?.files?.[0];
    if (!file) {
      setError('Выберите .xlsx файл для импорта.');
      return;
    }
    setPending(true);
    setError('');
    setImportReport(null);
    const form = new FormData();
    form.append('file', file);
    try {
      setImportReport(await apiForm<ProductImportReport>('/api/products/import', form));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <p className="eyebrow">СКЛАД / ОБЗОР</p>
          <h2>Каталог товаров</h2>
          <p className="subtle">Всего товаров: {result.total}</p>
        </div>
        <div className="head-actions">
          <button
            className="btn ghost"
            onClick={() => {
              setImportOpen((v) => !v);
              setImportReport(null);
            }}
          >
            Импорт
          </button>
          <button
            className="btn primary"
            onClick={() => {
              setEditing(null);
              setFormOpen((v) => !v);
            }}
          >
            + Новый товар
          </button>
        </div>
      </div>

      {error && <p className="form-message" role="alert">{error}</p>}
      {success && <p className="form-success" role="status">{success}</p>}

      <div className="filters">
        <input
          aria-label="Поиск товаров"
          placeholder="Название, SKU, EAN или ASIN"
          value={filters.search}
          onChange={(event) => updateFilters({ search: event.target.value })}
        />
        <select
          aria-label="Статус"
          value={filters.status}
          onChange={(event) => updateFilters({ status: event.target.value })}
        >
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Категория"
          value={filters.categoryId}
          onChange={(event) => updateFilters({ categoryId: event.target.value })}
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Ячейка"
          value={filters.cellId}
          onChange={(event) => updateFilters({ cellId: event.target.value })}
        >
          <option value="">Все ячейки</option>
          {cells.map((cell) => (
            <option key={cell.id} value={cell.id}>
              {cell.name}
            </option>
          ))}
        </select>
      </div>

      {importOpen && (
        <form className="upload-card" onSubmit={importSubmit}>
          <label className="file-picker">
            <input ref={importInput} type="file" accept=".xlsx" />
            <span>Выберите файл .xlsx</span>
          </label>
          <button className="btn primary" type="submit" disabled={pending}>
            {pending ? 'Импорт…' : 'Загрузить'}
          </button>
        </form>
      )}

      {importReport && (
        <div className="report-card">
          <div className="report-stats">
            <div><strong>{importReport.created}</strong><span>Создано</span></div>
            <div><strong>{importReport.skipped}</strong><span>Пропущено</span></div>
            <div><strong>{importReport.errors.length}</strong><span>Ошибок</span></div>
          </div>
          {importReport.errors.length > 0 && (
            <ul className="error-list">
              {importReport.errors.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {formOpen && (
        <form className="inline-form grid" onSubmit={save}>
          <label>
            SKU *
            <input name="sku" defaultValue={editing?.sku ?? ''} required />
          </label>
          <label>
            Наименование *
            <input name="name" defaultValue={editing?.name ?? ''} required />
          </label>
          <label>
            EAN
            <input name="ean" defaultValue={editing?.ean ?? ''} />
          </label>
          <label>
            ASIN
            <input name="asin" defaultValue={editing?.asin ?? ''} />
          </label>
          <label>
            Состояние
            <input name="condition" defaultValue={editing?.condition ?? ''} />
          </label>
          <label>
            Категория
            <select name="categoryId" defaultValue={editing?.categoryId ?? ''}>
              <option value="">Без категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ячейка
            <select name="cellId" defaultValue={editing?.cellId ?? ''}>
              <option value="">Без ячейки</option>
              {cells.map((cell) => (
                <option key={cell.id} value={cell.id}>
                  {cell.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Цена закупки
            <input name="purchasePrice" defaultValue={editing ? String(editing.purchasePrice) : ''} placeholder="0" />
          </label>
          <label>
            Цена продажи
            <input name="salePrice" defaultValue={editing ? String(editing.salePrice) : ''} placeholder="0" />
          </label>
          <label>
            Дата поступления
            <input name="arrivalDate" type="date" defaultValue={editing?.arrivalDate?.slice(0, 10) ?? ''} />
          </label>
          <label className="span-2">
            Изображения (URL, по одному на строку)
            <textarea
              name="images"
              rows={2}
              defaultValue={editing?.images?.join('\n') ?? ''}
              placeholder="https://…"
            />
          </label>
          <label className="span-2">
            Дополнительные поля (ключ=значение, по одному на строку)
            <textarea
              name="customFields"
              rows={2}
              defaultValue={
                editing?.customFields
                  ? Object.entries(editing.customFields)
                      .map(([key, value]) => `${key}=${String(value)}`)
                      .join('\n')
                  : ''
              }
              placeholder="вес=2.5 кг"
            />
          </label>
          <div className="form-actions span-2">
            <button className="btn primary" type="submit" disabled={pending}>
              {pending ? 'Сохранение…' : editing ? 'Сохранить' : 'Создать'}
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {selected.size > 0 && (
        <form className="inline-form grid bulk-form" onSubmit={bulkSubmit}>
          <span className="bulk-note span-2">Выбрано товаров: {selected.size}</span>
          <label>
            Цена продажи
            <input name="price" placeholder="2500" />
          </label>
          <label>
            Статус
            <select name="status" defaultValue="">
              <option value="" disabled>
                Не менять
              </option>
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Категория
            <select name="categoryId" defaultValue="">
              <option value="">Не менять</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ячейка
            <select name="cellId" defaultValue="">
              <option value="">Не менять</option>
              {cells.map((cell) => (
                <option key={cell.id} value={cell.id}>
                  {cell.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions span-2">
            <button className="btn primary" type="submit" disabled={pending}>
              Применить
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 30 }}>
                <input
                  type="checkbox"
                  aria-label="Выбрать все"
                  checked={result.data.length > 0 && result.data.every((p) => selected.has(p.id))}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelected(new Set(result.data.map((p) => p.id)));
                    } else {
                      setSelected(new Set());
                    }
                  }}
                />
              </th>
              <th>ТОВАР</th>
              <th>SKU</th>
              <th>ЯЧЕЙКА</th>
              <th>СТАТУС</th>
              <th>ЦЕНА</th>
              <th style={{ textAlign: 'right' }}>ДЕЙСТВИЯ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="empty-row">Загрузка…</td>
              </tr>
            ) : result.data.length ? (
              result.data.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      aria-label={`Выбрать ${product.name}`}
                    />
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <small>{product.category?.name || 'Без категории'}</small>
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.cell?.name || '—'}</td>
                  <td>
                    <span className="product-status">{productStatusLabel(product.status)}</span>
                  </td>
                  <td>{Number(product.salePrice).toLocaleString('ru-RU')} ₽</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions">
                      {['ARRIVAL', 'IN_STOCK', 'PLACED'].includes(product.status) && (
                        <button className="link" onClick={() => transition(product)}>
                          →{' '}
                          {productStatusLabel(
                            product.status === 'ARRIVAL'
                              ? 'IN_STOCK'
                              : product.status === 'IN_STOCK'
                                ? 'PLACED'
                                : 'SOLD',
                          )}
                        </button>
                      )}
                      <button
                        className="link"
                        onClick={() => {
                          setEditing(product);
                          setFormOpen(true);
                        }}
                      >
                        Изменить
                      </button>
                      <button className="link danger" onClick={() => remove(product)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-row">Товары не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="btn ghost"
          disabled={result.page <= 1}
          onClick={() => void load(result.page - 1)}
        >
          ← Назад
        </button>
        <span>
          Страница {result.page} из {Math.max(1, Math.ceil(result.total / PAGE_SIZE))}
        </span>
        <button
          className="btn ghost"
          disabled={result.page >= Math.ceil(result.total / PAGE_SIZE)}
          onClick={() => void load(result.page + 1)}
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}
