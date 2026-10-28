import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import {
  PALLET_MANIFEST_COLUMNS,
  PalletImportReport,
  PalletImportError,
} from '../dto/pallet-manifest.dto.js';
import { PrismaService } from '../../../tools/prisma/prisma.service.js';
import { ImageDownloadService } from './image-download.service.js';

const MAX_PHOTOS = 10;

@Injectable()
export class PalletImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageDownload: ImageDownloadService,
  ) {}

  /**
   * Жёсткая валидация заголовков: должны совпадать ровно 13 колонок.
   * Любое несовпадение → выбрасываем BadRequestException.
   */
  private validateHeaders(headerRow: string[]): void {
    const clean = headerRow.map((h) =>
      h.replace(/\*/g, '').trim().toLowerCase(),
    );
    const expected = PALLET_MANIFEST_COLUMNS.map((c) => c.toLowerCase());

    if (clean.length !== expected.length) {
      throw new BadRequestException(
        `Неверное количество колонок: ожидалось ${expected.length}, получено ${clean.length}. ` +
          `Ожидаемые: ${PALLET_MANIFEST_COLUMNS.join(', ')}`,
      );
    }

    for (let i = 0; i < expected.length; i++) {
      if (clean[i] !== expected[i]) {
        throw new BadRequestException(
          `Неверный заголовок колонки ${i + 1}: ожидалось «${PALLET_MANIFEST_COLUMNS[i]}», получено «${headerRow[i]}». ` +
            `Формат файла фиксирован и не подлежит ручному сопоставлению.`,
        );
      }
    }
  }

  private parseRow(raw: Record<string, string>): Record<string, string> {
    const mapped: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      mapped[k.replace(/\*/g, '').trim().toLowerCase()] = (v ?? '').trim();
    }
    return mapped;
  }

  async importFromBuffer(
    buffer: Buffer,
    userId?: string,
  ): Promise<PalletImportReport> {
    const report: PalletImportReport = {
      total: 0,
      created: 0,
      skippedDuplicates: 0,
      rejected: 0,
      errors: [],
    };

    // 1. Парсинг xlsx
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException(
        'Не удалось прочитать файл. Убедитесь, что это корректный .xlsx.',
      );
    }

    const sheetName =
      workbook.SheetNames.find(
        (n) => n === 'ТОВАРЫ' || n.toLowerCase().includes('товар'),
      ) || workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new BadRequestException(`Лист «${sheetName}» не найден в файле.`);
    }

    // 2. Читаем сырые данные
    const rawRows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false,
    });

    if (rawRows.length === 0) {
      throw new BadRequestException('Файл пуст — нет строк для импорта.');
    }

    // 3. Валидация заголовков по первой строке
    const headers = Object.keys(rawRows[0]);
    this.validateHeaders(headers);

    // 4. Обработка строк
    const categoryCache = new Map<string, string>();
    const cellCache = new Map<string, string>();
    report.total = rawRows.length;

    for (let i = 0; i < rawRows.length; i++) {
      const mapped = this.parseRow(rawRows[i]);
      const sku = mapped['sku'];
      const name = mapped['name'];
      const ean = mapped['ean'] || undefined;
      const asin = mapped['asin'] || undefined;

      // Валидация обязательных полей
      if (!sku || !name) {
        report.rejected++;
        report.errors.push({
          rowNumber: i + 2,
          sku: sku || '(пусто)',
          reason: 'Отсутствует обязательное поле SKU или наименование',
        });
        continue;
      }

      try {
        // Дедупликация по EAN
        if (ean) {
          const dupEan = await this.prisma.product.findUnique({
            where: { ean },
            select: { id: true },
          });
          if (dupEan) {
            report.skippedDuplicates++;
            continue;
          }
        }

        // Дедупликация по ASIN
        if (asin) {
          const dupAsin = await this.prisma.product.findUnique({
            where: { asin },
            select: { id: true },
          });
          if (dupAsin) {
            report.skippedDuplicates++;
            continue;
          }
        }

        // Дедупликация по SKU
        const dupSku = await this.prisma.product.findUnique({
          where: { sku },
          select: { id: true },
        });
        if (dupSku) {
          report.skippedDuplicates++;
          continue;
        }

        // Разрешаем категорию
        let categoryId: string | undefined;
        const catName = mapped['categoryname'];
        if (catName) {
          if (categoryCache.has(catName)) {
            categoryId = categoryCache.get(catName);
          } else {
            const cat = await this.prisma.category.upsert({
              where: { name: catName },
              update: {},
              create: { name: catName },
            });
            categoryId = cat.id;
            categoryCache.set(catName, cat.id);
          }
        }

        // Разрешаем ячейку
        let cellId: string | undefined;
        const cellName = mapped['cellname'];
        if (cellName) {
          if (cellCache.has(cellName)) {
            cellId = cellCache.get(cellName);
          } else {
            const cell = await this.prisma.cell.upsert({
              where: { name: cellName },
              update: {},
              create: { name: cellName },
            });
            cellId = cell.id;
            cellCache.set(cellName, cell.id);
          }
        }

        // Цены
        const parsePrice = (v: string): number | undefined => {
          if (!v) return undefined;
          const num = Number(v.replace(',', '.'));
          return Number.isFinite(num) ? num : undefined;
        };

        // Парсинг images (URL для фоновой загрузки)
        const imagesRaw = mapped['images'] || '';
        const imageUrls = imagesRaw
          ? imagesRaw
              .split(/[;,]/)
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, MAX_PHOTOS)
          : [];

        // Парсинг customFields
        const customFieldsRaw = mapped['customfields'] || '';
        const customFields: Record<string, string> = {};
        if (customFieldsRaw) {
          for (const pair of customFieldsRaw.split(';')) {
            const eq = pair.indexOf('=');
            if (eq > 0) {
              const k = pair.slice(0, eq).trim();
              const v = pair.slice(eq + 1).trim();
              if (k) customFields[k] = v;
            }
          }
        }

        // Парсинг showcaseStatuses
        const ssRaw = mapped['showcasestatuses'] || '';
        const showcaseStatuses: Record<string, string> = {};
        if (ssRaw) {
          for (const pair of ssRaw.split(';')) {
            const eq = pair.indexOf('=');
            if (eq > 0) {
              const k = pair.slice(0, eq).trim();
              const v = pair.slice(eq + 1).trim();
              if (k) showcaseStatuses[k] = v;
            }
          }
        }

        // Создаём товар со статусом ARRIVAL
        // Если есть URL-фото → сохраняем их как есть, а фоном заменяем на Minio
        const product = await this.prisma.product.create({
          data: {
            sku,
            name,
            ean: ean || null,
            asin: asin || null,
            categoryId: categoryId || null,
            condition: mapped['condition'] || null,
            purchasePrice: parsePrice(mapped['purchaseprice']) ?? 0,
            salePrice: parsePrice(mapped['saleprice']) ?? 0,
            cellId: cellId || null,
            arrivalDate: mapped['arrivaldate']
              ? new Date(mapped['arrivaldate'])
              : null,
            images: imageUrls,
            customFields: customFields as any,
            showcaseStatuses: showcaseStatuses as any,
            status: 'ARRIVAL',
            ...(userId && { createdById: userId }),
          },
        });

        // Фоновая загрузка изображений в Minio
        if (imageUrls.length > 0) {
          this.imageDownload.downloadProductImagesInBackground(
            product.id,
            imageUrls,
          );
        }

        report.created++;
      } catch (err: any) {
        report.rejected++;
        report.errors.push({
          rowNumber: i + 2,
          sku,
          reason: err?.message || 'Неизвестная ошибка',
        });
      }
    }

    return report;
  }

  /** Генерация CSV-отчёта об ошибках */
  generateCsvReport(errors: PalletImportError[]): string {
    const header = '№ строки,SKU,Причина';
    const rows = errors.map(
      (e) => `${e.rowNumber},"${e.sku}","${e.reason.replace(/"/g, '""')}"`,
    );
    return [header, ...rows].join('\n');
  }
}
