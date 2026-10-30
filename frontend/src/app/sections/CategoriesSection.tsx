'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, Category } from '@/lib/api';

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setCategories(await api<Category[]>('/api/categories'));
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
    const name = String(form.get('name') ?? '').trim();
    try {
      if (editing) {
        await api(`/api/categories/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
      } else {
        await api('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
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
    if (!window.confirm('Удалить категорию?')) return;
    try {
      await api(`/api/categories/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <p className="eyebrow">СКЛАД / СПРАВОЧНИКИ</p>
          <h2>Категории</h2>
        </div>
        <button
          className="btn primary"
          onClick={() => {
            setEditing(null);
            setFormOpen((v) => !v);
          }}
        >
          + Новая категория
        </button>
      </div>

      {error && <p className="form-message" role="alert">{error}</p>}

      {formOpen && (
        <form className="inline-form" onSubmit={save}>
          <label>
            Название категории
            <input
              name="name"
              defaultValue={editing?.name ?? ''}
              minLength={2}
              maxLength={50}
              required
            />
          </label>
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
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>КАТЕГОРИЯ</th>
              <th>ТОВАРОВ</th>
              <th style={{ textAlign: 'right' }}>ДЕЙСТВИЯ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="empty-row">Загрузка…</td>
              </tr>
            ) : categories.length ? (
              categories.map((category) => (
                <tr key={category.id}>
                  <td><strong>{category.name}</strong></td>
                  <td>{category._count?.products ?? 0}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions">
                      <button
                        className="link"
                        onClick={() => {
                          setEditing(category);
                          setFormOpen(true);
                        }}
                      >
                        Изменить
                      </button>
                      <button className="link danger" onClick={() => remove(category.id)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="empty-row">Категории не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
