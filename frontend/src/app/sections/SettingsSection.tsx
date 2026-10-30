'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number';
  group: string;
  defaultValue?: string;
}

const KNOWN_FIELDS: FieldDef[] = [
  { key: 'system_name', label: 'Название системы', group: 'Общие', defaultValue: 'Ezon' },
  { key: 'currency', label: 'Валюта по умолчанию', group: 'Общие', defaultValue: 'RUB' },
  { key: 's3_endpoint', label: 'Endpoint', group: 'Хранилище S3' },
  { key: 's3_bucket', label: 'Bucket', group: 'Хранилище S3', defaultValue: 'ezon-uploads' },
  { key: 's3_region', label: 'Region', group: 'Хранилище S3', defaultValue: 'us-east-1' },
  { key: 'session_timeout_hours', label: 'Таймаут сессии (часов)', group: 'Сессия', type: 'number', defaultValue: '24' },
];

export default function SettingsSection() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    api<Record<string, string>>('/api/settings')
      .then((map) => setValues(map))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const groups = [...new Set(KNOWN_FIELDS.map((f) => f.group))];
  const knownKeys = new Set(KNOWN_FIELDS.map((f) => f.key));
  const extraKeys = Object.keys(values).filter((key) => !knownKeys.has(key));

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setSuccess(false);
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      payload[key] = String(value);
    }
    try {
      const updated = await api<Record<string, string>>('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setValues(updated);
      setSuccess(true);
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
          <p className="eyebrow">СИСТЕМА / КОНФИГУРАЦИЯ</p>
          <h2>Настройки</h2>
        </div>
      </div>

      {error && <p className="form-message" role="alert">{error}</p>}
      {success && <p className="form-success" role="status">Настройки сохранены</p>}

      {loading ? (
        <p className="subtle">Загрузка…</p>
      ) : (
        <form className="settings-form" onSubmit={save}>
          {groups.map((group) => (
            <fieldset key={group}>
              <legend>{group}</legend>
              <div className="form-grid">
                {KNOWN_FIELDS.filter((f) => f.group === group).map((field) => (
                  <label key={field.key}>
                    {field.label}
                    <input
                      name={field.key}
                      type={field.type ?? 'text'}
                      defaultValue={values[field.key] ?? field.defaultValue ?? ''}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          {extraKeys.length > 0 && (
            <fieldset>
              <legend>Дополнительно</legend>
              <div className="form-grid">
                {extraKeys.map((key) => (
                  <label key={key}>
                    {key}
                    <input name={key} defaultValue={values[key] ?? ''} />
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <button className="btn primary" type="submit" disabled={pending}>
            {pending ? 'Сохранение…' : 'Сохранить настройки'}
          </button>
        </form>
      )}
    </div>
  );
}
