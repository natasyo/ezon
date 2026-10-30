'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, Cell } from '@/lib/api';

export default function CellsSection() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cell | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setCells(await api<Cell[]>('/api/cells'));
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
        await api(`/api/cells/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
      } else {
        await api('/api/cells', {
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
    if (!window.confirm('Удалить ячейку?')) return;
    try {
      await api(`/api/cells/${id}`, { method: 'DELETE' });
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
          <h2>Ячейки хранения</h2>
        </div>
        <button
          className="btn primary"
          onClick={() => {
            setEditing(null);
            setFormOpen((v) => !v);
          }}
        >
          + Новая ячейка
        </button>
      </div>

      {error && <p className="form-message" role="alert">{error}</p>}

      {formOpen && (
        <form className="inline-form" onSubmit={save}>
          <label>
            Название ячейки
            <input
              name="name"
              defaultValue={editing?.name ?? ''}
              minLength={1}
              maxLength={20}
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
              <th>ЯЧЕЙКА</th>
              <th>ТОВАРОВ</th>
              <th style={{ textAlign: 'right' }}>ДЕЙСТВИЯ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="empty-row">Загрузка…</td>
              </tr>
            ) : cells.length ? (
              cells.map((cell) => (
                <tr key={cell.id}>
                  <td><strong>{cell.name}</strong></td>
                  <td>{cell._count?.products ?? 0}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions">
                      <button
                        className="link"
                        onClick={() => {
                          setEditing(cell);
                          setFormOpen(true);
                        }}
                      >
                        Изменить
                      </button>
                      <button className="link danger" onClick={() => remove(cell.id)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="empty-row">Ячейки не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
