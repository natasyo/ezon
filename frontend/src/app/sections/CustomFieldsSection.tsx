'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, Category, CustomField } from '@/lib/api';

export default function CustomFieldsSection() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomField | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [configs, cats] = await Promise.all([
        api<CustomField[]>('/api/custom-fields'),
        api<Category[]>('/api/categories'),
      ]);
      setFields(configs);
      setCategories(cats);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = {
      key: String(form.get('key') ?? '').trim(),
      label: String(form.get('label') ?? '').trim(),
      type: String(form.get('type') ?? 'text').trim(),
      categoryId: String(form.get('categoryId') ?? '').trim(),
    };
    try {
      if (editing) {
        await api(`/api/custom-fields/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/custom-fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
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

  async function remove(id: string) {
    if (!window.confirm('Удалить дополнительное поле?')) return;
    try {
      await api(`/api/custom-fields/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <p className="eyebrow">СКЛАД / НАСТРОЙКА</p>
          <h2>Дополнительные поля</h2>
        </div>
        <button
          className="btn primary"
          onClick={() => {
            setEditing(null);
            setFormOpen((v) => !v);
          }}
        >
          + Новое поле
        </button>
      </div>

      {error && <p className="form-message" role="alert">{error}</p>}

      {formOpen && (
        <form className="inline-form grid" onSubmit={save}>
          <label>
            Ключ
            <input name="key" defaultValue={editing?.key ?? ''} minLength={1} required />
          </label>
          <label>
            Подпись
            <input name="label" defaultValue={editing?.label ?? ''} minLength={1} required />
          </label>
          <label>
            Тип
            <select name="type" defaultValue={editing?.type ?? 'text'}>
              <option value="text">text</option>
              <option value="number">number</option>
              <option value="date">date</option>
              <option value="boolean">boolean</option>
            </select>
          </label>
          <label>
            Категория
            <select name="categoryId" defaultValue={editing?.categoryId ?? ''} required>
              <option value="" disabled>
                Выберите категорию
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
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

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>КЛЮЧ</th>
              <th>ПОДПИСЬ</th>
              <th>ТИП</th>
              <th>КАТЕГОРИЯ</th>
              <th style={{ textAlign: 'right' }}>ДЕЙСТВИЯ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="empty-row">Загрузка…</td>
              </tr>
            ) : fields.length ? (
              fields.map((field) => (
                <tr key={field.id}>
                  <td><strong>{field.key}</strong></td>
                  <td>{field.label}</td>
                  <td>{field.type}</td>
                  <td>{field.category?.name ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions">
                      <button
                        className="link"
                        onClick={() => {
                          setEditing(field);
                          setFormOpen(true);
                        }}
                      >
                        Изменить
                      </button>
                      <button className="link danger" onClick={() => remove(field.id)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-row">Дополнительные поля не настроены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
