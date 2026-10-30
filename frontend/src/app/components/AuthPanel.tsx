'use client';

import { FormEvent, useState } from 'react';
import { api, SessionUser } from '@/lib/api';

type Mode = 'login' | 'register';

export default function AuthPanel({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (mode === 'register' && values.password !== values.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setPending(true);
    try {
      const data = await api<{ user: SessionUser }>(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (mode === 'register') {
        setMode('login');
        setError('Аккаунт создан. Теперь войдите в систему.');
      } else {
        onLogin(data.user);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="form-wrap">
      <div className="mode-switch" role="tablist" aria-label="Выберите действие">
        <button
          className={mode === 'login' ? 'active' : ''}
          onClick={() => {
            setMode('login');
            setError('');
          }}
          role="tab"
          aria-selected={mode === 'login'}
        >
          Вход
        </button>
        <button
          className={mode === 'register' ? 'active' : ''}
          onClick={() => {
            setMode('register');
            setError('');
          }}
          role="tab"
          aria-selected={mode === 'register'}
        >
          Регистрация
        </button>
      </div>
      <p className="eyebrow form-eyebrow">
        {mode === 'login' ? 'С ВОЗВРАЩЕНИЕМ' : 'НОВАЯ УЧЕТНАЯ ЗАПИСЬ'}
      </p>
      <h2>{mode === 'login' ? 'Войти в Ezon' : 'Создать аккаунт'}</h2>
      <p className="subtle">
        {mode === 'login'
          ? 'Введите данные своей учетной записи.'
          : 'Заполните данные для доступа к системе.'}
      </p>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <label>
            Имя пользователя
            <input name="userName" autoComplete="username" minLength={3} maxLength={30} required />
          </label>
        )}
        {mode === 'register' && (
          <label>
            Отображаемое имя <span className="optional">НЕОБЯЗАТЕЛЬНО</span>
            <input name="displayName" autoComplete="name" maxLength={100} />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Пароль
          <input
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={6}
            maxLength={100}
            required
          />
        </label>
        {mode === 'register' && (
          <label>
            Повторите пароль
            <input name="confirmPassword" type="password" autoComplete="new-password" minLength={6} maxLength={100} required />
          </label>
        )}
        {error && <p className="form-message" role="alert">{error}</p>}
        <button className="submit-button" type="submit" disabled={pending}>
          {pending ? 'Подождите…' : mode === 'login' ? 'Войти в систему' : 'Создать аккаунт'}
          <span>↗</span>
        </button>
      </form>
      <p className="form-footnote">
        Продолжая, вы подтверждаете право доступа к рабочему пространству.
      </p>
    </div>
  );
}
