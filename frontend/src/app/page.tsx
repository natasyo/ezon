'use client';

import { useEffect, useState } from 'react';
import { api, SessionUser } from '@/lib/api';
import AuthPanel from './components/AuthPanel';
import CatalogSection from './sections/CatalogSection';
import CellsSection from './sections/CellsSection';
import CategoriesSection from './sections/CategoriesSection';
import EmployeesSection from './sections/EmployeesSection';
import CustomFieldsSection from './sections/CustomFieldsSection';
import SettingsSection from './sections/SettingsSection';
import PalletsSection from './sections/PalletsSection';

type Section =
  | 'catalog'
  | 'cells'
  | 'categories'
  | 'employees'
  | 'custom-fields'
  | 'pallets'
  | 'settings';

const NAV: { id: Section; label: string }[] = [
  { id: 'catalog', label: 'Каталог товаров' },
  { id: 'cells', label: 'Ячейки' },
  { id: 'categories', label: 'Категории' },
  { id: 'employees', label: 'Сотрудники' },
  { id: 'custom-fields', label: 'Доп. поля' },
  { id: 'pallets', label: 'Паллеты' },
  { id: 'settings', label: 'Настройки' },
];

function BrandPanel() {
  return (
    <section className="brand-panel" aria-label="Ezon">
      <div className="brand-top">
        <span className="brand-mark">E</span>
        <span>EZON / WAREHOUSE</span>
      </div>
      <div className="brand-copy">
        <p className="eyebrow">СИСТЕМА СКЛАДСКОГО УЧЕТА</p>
        <h1>
          Порядок
          <br />
          в каждой
          <br />
          <em>ячейке.</em>
        </h1>
        <p className="brand-note">Товары, перемещения и запасы в одном рабочем пространстве.</p>
      </div>
      <div className="panel-footer">
        <span>ОПЕРАЦИОННАЯ ПЛАТФОРМА</span>
        <span>01 — 2026</span>
      </div>
    </section>
  );
}

export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('catalog');

  useEffect(() => {
    api<{ user: SessionUser | null }>('/api/auth/session')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(
      () => undefined,
    );
    setUser(null);
    setSection('catalog');
  }

  if (loading) {
    return (
      <main className="screen">
        <BrandPanel />
        <section className="access-panel">
          <p className="subtle">Загрузка…</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="screen">
        <BrandPanel />
        <section className="access-panel">
          <div className="access-header">
            <span>ДОСТУП К СИСТЕМЕ</span>
            <span className="status">
              <i /> ONLINE
            </span>
          </div>
          <AuthPanel onLogin={setUser} />
          <div className="access-footer">
            <span>EZON INVENTORY</span>
            <span>SECURE WORKSPACE</span>
          </div>
        </section>
      </main>
    );
  }

  const activeLabel = NAV.find((item) => item.id === section)?.label ?? '';

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">E</span>
          <span>EZON / WAREHOUSE</span>
        </div>
        <nav className="nav" aria-label="Разделы">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={section === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="sidebar-user">
            <strong>{user.displayName || user.userName}</strong>
            <small>{user.email}</small>
          </p>
          <button className="logout-button" onClick={logout} aria-label="Выйти" title="Выйти">
            ↗
          </button>
        </div>
      </aside>
      <section className="workspace">
        <header className="workspace-head">
          <div>
            <p className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО / {activeLabel.toUpperCase()}</p>
            <h2>{activeLabel}</h2>
          </div>
          <span className="status">
            <i /> ONLINE
          </span>
        </header>
        {section === 'catalog' && <CatalogSection />}
        {section === 'cells' && <CellsSection />}
        {section === 'categories' && <CategoriesSection />}
        {section === 'employees' && <EmployeesSection />}
        {section === 'custom-fields' && <CustomFieldsSection />}
        {section === 'pallets' && <PalletsSection />}
        {section === 'settings' && <SettingsSection />}
      </section>
    </main>
  );
}
