'use client';

import { FormEvent, useRef, useState } from 'react';
import { apiForm, PalletImportReport } from '@/lib/api';

export default function PalletsSection() {
  const [report, setReport] = useState<PalletImportReport | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = inputRef.current;
    const file = input?.files?.[0];
    if (!file) {
      setError('Выберите .xlsx файл манифеста.');
      return;
    }
    setPending(true);
    setError('');
    setReport(null);
    const form = new FormData();
    form.append('file', file);
    try {
      setReport(await apiForm<PalletImportReport>('/api/pallets/import', form));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  function downloadCsv() {
    if (!report) return;
    const rows = [['№ строки', 'SKU', 'Причина'], ...report.errors.map((e) => [String(e.rowNumber), e.sku, e.reason])];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pallet-import-errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <p className="eyebrow">СКЛАД / ПРИЁМКА</p>
          <h2>Импорт паллет</h2>
          <p className="subtle">
            Загрузите манифест паллеты в формате .xlsx. Новые товары будут созданы со статусом «Поступление».
          </p>
        </div>
      </div>

      <form className="upload-card" onSubmit={upload}>
        <label className="file-picker">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
          />
          <span>{fileName || 'Выберите файл .xlsx'}</span>
        </label>
        <button className="btn primary" type="submit" disabled={pending}>
          {pending ? 'Импорт…' : 'Загрузить манифест'}
        </button>
      </form>

      {error && <p className="form-message" role="alert">{error}</p>}

      {report && (
        <div className="report-card">
          <div className="report-stats">
            <div><strong>{report.total}</strong><span>Всего строк</span></div>
            <div><strong>{report.created}</strong><span>Создано</span></div>
            <div><strong>{report.skippedDuplicates}</strong><span>Дубликатов</span></div>
            <div><strong>{report.rejected}</strong><span>Отклонено</span></div>
          </div>

          {report.errors.length > 0 && (
            <>
              <div className="report-head">
                <h3>Ошибки импорта</h3>
                <button className="btn ghost" type="button" onClick={downloadCsv}>
                  Скачать CSV
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>СТРОКА</th>
                      <th>SKU</th>
                      <th>ПРИЧИНА</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.errors.map((item, index) => (
                      <tr key={index}>
                        <td>{item.rowNumber}</td>
                        <td>{item.sku}</td>
                        <td>{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {report.errors.length === 0 && report.total > 0 && (
            <p className="form-success">Импорт завершён без ошибок.</p>
          )}
        </div>
      )}
    </div>
  );
}
