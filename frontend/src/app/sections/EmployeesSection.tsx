'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, Employee, ROLE_LABELS, UserRole } from '@/lib/api';

const ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

export default function EmployeesSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [pending, setPending] = useState(false);

  async function load(searchTerm = search) {
    setLoading(true);
    try {
      const query = searchTerm
        ? `?search=${encodeURIComponent(searchTerm)}`
        : '';
      setEmployees(await api<Employee[]>(`/api/employees${query}`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);

    if (!editing) {
      const password = String(form.get('password') ?? '');
      const confirm = String(form.get('confirmPassword') ?? '');
      if (password !== confirm) {
        setError('Пароли не совпадают');
        setPending(false);
        return;
      }
    }

    const payload: Record<string, string> = {
      userName: String(form.get('userName') ?? '').trim(),
      displayName: String(form.get('displayName') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      role: String(form.get('role') ?? 'EMPLOYEE'),
    };
    const password = String(form.get('password') ?? '').trim();
    if (password) {
      payload.password = password;
      payload.confirmPassword = password;
    }

    try {
      if (editing) {
        await api(`/api/employees/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        if (!payload.password) {
          setError('Пароль обязателен');
          setPending(false);
          return;
        }
        payload.confirmPassword = payload.password;
        await api('/api/employees', {
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

  async function toggleActive(employee: Employee) {
    const action = employee.isDeactivated ? 'реактивировать' : 'деактивировать';
    if (!window.confirm(`Вы уверены, что хотите ${action} сотрудника «${employee.displayName || employee.userName}»?`)) {
      return;
    }
    try {
      await api(`/api/employees/${employee.id}/${employee.isDeactivated ? 'reactivate' : 'deactivate'}`, {
        method: 'POST',
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <p className="eyebrow">ПЕРСОНАЛ / ДОСТУП</p>
          <h2>Сотрудники</h2>
        </div>
        <button
          className="btn primary"
          onClick={() => {
            setEditing(null);
            setFormOpen((v) => !v);
          }}
        >
          + Добавить сотрудника
        </button>
      </div>

      <div className="toolbar">
        <input
          aria-label="Поиск сотрудников"
          placeholder="Поиск по имени, email…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            void load(event.target.value);
          }}
        />
      </div>

      {error && <p className="form-message" role="alert">{error}</p>}

      {formOpen && (
        <form className="inline-form grid" onSubmit={save}>
          <label>
            Имя пользователя
            <input name="userName" defaultValue={editing?.userName ?? ''} minLength={3} maxLength={30} required />
          </label>
          <label>
            Отображаемое имя
            <input name="displayName" defaultValue={editing?.displayName ?? ''} maxLength={100} />
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue={editing?.email ?? ''} required />
          </label>
          <label>
            Роль
            <select name="role" defaultValue={editing?.role ?? 'EMPLOYEE'}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Пароль{editing ? ' (новый, необязательно)' : ''}
            <input name="password" type="password" minLength={6} maxLength={100} required={!editing} />
          </label>
          {!editing && (
            <label>
              Повторите пароль
              <input name="confirmPassword" type="password" minLength={6} maxLength={100} required />
            </label>
          )}
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
              <th>СОТРУДНИК</th>
              <th>EMAIL</th>
              <th>РОЛЬ</th>
              <th>СТАТУС</th>
              <th style={{ textAlign: 'right' }}>ДЕЙСТВИЯ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="empty-row">Загрузка…</td>
              </tr>
            ) : employees.length ? (
              employees.map((employee) => (
                <tr key={employee.id} className={employee.isDeactivated ? 'muted' : ''}>
                  <td>
                    <strong>{employee.displayName || employee.userName}</strong>
                    <small>@{employee.userName}</small>
                  </td>
                  <td>{employee.email}</td>
                  <td>{ROLE_LABELS[employee.role]}</td>
                  <td>
                    <span className={employee.isDeactivated ? 'badge danger' : 'badge ok'}>
                      {employee.isDeactivated ? 'Деактивирован' : 'Активен'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions">
                      <button
                        className="link"
                        onClick={() => {
                          setEditing(employee);
                          setFormOpen(true);
                        }}
                      >
                        Изменить
                      </button>
                      <button
                        className={employee.isDeactivated ? 'link' : 'link danger'}
                        onClick={() => toggleActive(employee)}
                      >
                        {employee.isDeactivated ? 'Реактивировать' : 'Деактивировать'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-row">Сотрудники не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
