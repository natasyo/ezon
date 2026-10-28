import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Ezon | Складской учет',
  description: 'Система управления складскими запасами Ezon',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}