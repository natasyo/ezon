'use client';

import { FormEvent, useEffect, useState } from 'react';

type User = { id: string; userName: string; displayName: string | null; email: string };
type Product = { id: string; name: string; sku: string; status: string; salePrice: number; cell?: { name: string } | null; category?: { name: string } | null };
type Mode = 'login' | 'register';

export default function Home() {
  const [mode, setMode] = useState<Mode>('login');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setUser(data?.user ?? null))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingProducts(true);
    const query = new URLSearchParams({ search, pageSize: '30' });
    fetch(`/api/products?${query}`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setProducts(data.data))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [user, search]);

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
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        const messages = data.message;
        setError(Array.isArray(messages) ? messages.join('. ') : typeof messages === 'string' ? messages : 'Не удалось выполнить запрос');
        return;
      }
      if (mode === 'register') {
        setMode('login');
        setError('Аккаунт создан. Теперь войдите в систему.');
      } else {
        setUser(data.user);
      }
    } catch {
      setError('Сервер пока недоступен. Попробуйте позже.');
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }

  return (
    <main className="screen">
      <section className="brand-panel" aria-label="Ezon">
        <div className="brand-top"><span className="brand-mark">E</span><span>EZON / WAREHOUSE</span></div>
        <div className="brand-copy">
          <p className="eyebrow">СИСТЕМА СКЛАДСКОГО УЧЕТА</p>
          <h1>Порядок<br />в каждой<br /><em>ячейке.</em></h1>
          <p className="brand-note">Товары, перемещения и запасы в одном рабочем пространстве.</p>
        </div>
        <div className="panel-footer"><span>ОПЕРАЦИОННАЯ ПЛАТФОРМА</span><span>01 — 2026</span></div>
      </section>

      <section className="access-panel">
        <div className="access-header"><span>ДОСТУП К СИСТЕМЕ</span><span className="status"><i /> ONLINE</span></div>
        {user ? (
          <div className="warehouse">
            <div className="warehouse-heading">
              <div><p className="eyebrow">СКЛАД / ОБЗОР</p><h2>Каталог товаров</h2><p className="subtle">Здравствуйте, {user.displayName || user.userName}</p></div>
              <button className="logout-button" onClick={logout} aria-label="Выйти" title="Выйти">↗</button>
            </div>
            <div className="catalog-toolbar"><span>НАЙТИ ТОВАР</span><input aria-label="Поиск товаров" placeholder="Название, SKU, EAN или ASIN" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            <div className="product-table-wrap">
              <table><thead><tr><th>ТОВАР</th><th>SKU</th><th>ЯЧЕЙКА</th><th>СТАТУС</th><th>ЦЕНА</th></tr></thead>
                <tbody>{loadingProducts ? <tr><td colSpan={5} className="empty-row">Загрузка каталога…</td></tr> : products.length ? products.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><small>{product.category?.name || 'Без категории'}</small></td><td>{product.sku}</td><td>{product.cell?.name || '—'}</td><td><span className="product-status">{product.status}</span></td><td>{Number(product.salePrice).toLocaleString('ru-RU')} ₽</td></tr>) : <tr><td colSpan={5} className="empty-row">Товары не найдены</td></tr>}</tbody>
              </table>
            </div>
            <p className="catalog-note">Показаны первые 30 товаров</p>
          </div>
        ) : (
          <div className="form-wrap">
            <div className="mode-switch" role="tablist" aria-label="Выберите действие">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }} role="tab" aria-selected={mode === 'login'}>Вход</button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }} role="tab" aria-selected={mode === 'register'}>Регистрация</button>
            </div>
            <p className="eyebrow form-eyebrow">{mode === 'login' ? 'С ВОЗВРАЩЕНИЕМ' : 'НОВАЯ УЧЕТНАЯ ЗАПИСЬ'}</p>
            <h2>{mode === 'login' ? 'Войти в Ezon' : 'Создать аккаунт'}</h2>
            <p className="subtle">{mode === 'login' ? 'Введите данные своей учетной записи.' : 'Заполните данные для доступа к системе.'}</p>
            <form onSubmit={submit}>
              {mode === 'register' && <label>Имя пользователя<input name="userName" autoComplete="username" minLength={3} maxLength={30} required /></label>}
              {mode === 'register' && <label>Отображаемое имя <span className="optional">НЕОБЯЗАТЕЛЬНО</span><input name="displayName" autoComplete="name" maxLength={100} /></label>}
              <label>Email<input name="email" type="email" autoComplete="email" required /></label>
              <label>Пароль<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} maxLength={100} required /></label>
              {mode === 'register' && <label>Повторите пароль<input name="confirmPassword" type="password" autoComplete="new-password" minLength={6} maxLength={100} required /></label>}
              {error && <p className="form-message" role="alert">{error}</p>}
              <button className="submit-button" type="submit" disabled={pending}>{pending ? 'Подождите…' : mode === 'login' ? 'Войти в систему' : 'Создать аккаунт'}<span>↗</span></button>
            </form>
            <p className="form-footnote">Продолжая, вы подтверждаете право доступа к рабочему пространству.</p>
          </div>
        )}
        <div className="access-footer"><span>EZON INVENTORY</span><span>SECURE WORKSPACE</span></div>
      </section>
    </main>
  );
}