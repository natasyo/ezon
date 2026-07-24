import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../tools/prisma/prisma.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { SearchProductDto } from '../dto/search-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { BulkUpdateDto } from '../dto/bulk-update.dto.js';
import { ProductStatus } from '../entities/product-status.enum.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';

const ALLOWED_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  [ProductStatus.ARRIVAL]: [ProductStatus.IN_STOCK],
  [ProductStatus.IN_STOCK]: [ProductStatus.PLACED, ProductStatus.WRITTEN_OFF],
  [ProductStatus.PLACED]: [ProductStatus.SOLD, ProductStatus.IN_STOCK],
  [ProductStatus.SOLD]: [],
  [ProductStatus.WRITTEN_OFF]: [],
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.ARRIVAL]: 'Поступление',
  [ProductStatus.IN_STOCK]: 'На складе',
  [ProductStatus.PLACED]: 'Размещён',
  [ProductStatus.SOLD]: 'Продан',
  [ProductStatus.WRITTEN_OFF]: 'Списан',
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SearchProductDto) {
    const { page = 1, pageSize = 50, search, ...filters } = query;

    const where: Prisma.ProductWhereInput = {};

    if (filters.sku) where.sku = { contains: filters.sku, mode: 'insensitive' };
    if (filters.ean) where.ean = { contains: filters.ean, mode: 'insensitive' };
    if (filters.asin)
      where.asin = { contains: filters.asin, mode: 'insensitive' };
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.condition)
      where.condition = { contains: filters.condition, mode: 'insensitive' };
    if (filters.status) where.status = filters.status as ProductStatus;
    if (filters.cellId) where.cellId = filters.cellId;

    // Фильтр по статусу на конкретной витрине
    if (filters.showcase) {
      where.showcaseStatuses = {
        path: ['$', filters.showcase],
        equals: 'VISIBLE',
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { ean: { contains: search, mode: 'insensitive' } },
        { asin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: { category: true, cell: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { createdBy: true, category: true, cell: true },
    });
    if (!product) throw new NotFoundException('Товар не найден');
    return product;
  }

  async create(dto: CreateProductDto, createdById?: string) {
    // ✅ Проверка уникальности sku
    if (dto.sku) {
      const existing = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });
      if (existing) {
        const error = new ConflictException('Товар с таким SKU уже существует');
        (error as any).fieldErrors = {
          sku: 'Товар с таким SKU уже существует',
        };
        throw error;
      }
    }

    // ✅ Проверка уникальности ean — БД сама не даст вставить дубликат (@unique)
    // но проверяем на уровне приложения для понятного сообщения
    if (dto.ean) {
      const existing = await this.prisma.product.findUnique({
        where: { ean: dto.ean },
      });
      if (existing) {
        const error = new ConflictException('Товар с таким EAN уже существует');
        (error as any).fieldErrors = {
          ean: 'Товар с таким EAN уже существует',
        };
        throw error;
      }
    }

    // ✅ Проверка уникальности asin
    if (dto.asin) {
      const existing = await this.prisma.product.findUnique({
        where: { asin: dto.asin },
      });
      if (existing) {
        const error = new ConflictException(
          'Товар с таким ASIN уже существует',
        );
        (error as any).fieldErrors = {
          asin: 'Товар с таким ASIN уже существует',
        };
        throw error;
      }
    }

    // ✅ Пробуем создать — если дубликат проскочил (race condition), Prisma выбросит ошибку
    try {
      return await this.prisma.product.create({
        data: {
          sku: dto.sku,
          ean: dto.ean || null,
          asin: dto.asin || null,
          name: dto.name,
          categoryId: dto.categoryId || null,
          condition: dto.condition || null,
          purchasePrice: dto.purchasePrice ?? 0,
          salePrice: dto.salePrice ?? 0,
          cellId: dto.cellId || null,
          arrivalDate: dto.arrivalDate ? new Date(dto.arrivalDate) : null,
          images: dto.images ?? [],
          customFields: (dto.customFields ?? {}) as Prisma.InputJsonValue,
          showcaseStatuses: (dto.showcaseStatuses ??
            {}) as Prisma.InputJsonValue,
          ...(createdById && { createdById }),
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          const target = (e.meta?.target as string[]) ?? [];
          if (target.includes('ean')) {
            throw new ConflictException('Товар с таким EAN уже существует');
          }
          if (target.includes('asin')) {
            throw new ConflictException('Товар с таким ASIN уже существует');
          }
          if (target.includes('sku')) {
            throw new ConflictException('Товар с таким SKU уже существует');
          }
        }
      }
      throw e;
    }
  }

  async bulkUpdate(dto: BulkUpdateDto) {
    if (!dto.ids || dto.ids.length === 0) {
      throw new BadRequestException(
        'Не выбраны товары для массового обновления',
      );
    }

    const data: Prisma.ProductUncheckedUpdateInput = {};
    if (typeof dto.price === 'number' && !isNaN(dto.price))
      data.salePrice = dto.price;
    if (dto.categoryId) data.categoryId = dto.categoryId;

    if (dto.status) data.status = dto.status as ProductStatus;
    if (dto.cellId) data.cellId = dto.cellId;
    // ❌ ean/asin НЕ обновляются через bulkUpdate — защита от дубликатов

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Не заполнено ни одно поле для обновления');
    }

    return this.prisma.product.updateMany({
      where: { id: { in: dto.ids } },
      data,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id); // проверить существование

    // ✅ Если передан ean — проверяем уникальность среди других товаров
    if (dto.ean) {
      const existing = await this.prisma.product.findUnique({
        where: { ean: dto.ean },
      });
      if (existing && existing.id !== id) {
        const error = new ConflictException('Товар с таким EAN уже существует');
        (error as any).fieldErrors = {
          ean: 'Товар с таким EAN уже существует',
        };
        throw error;
      }
    }

    // ✅ Если передан asin — проверяем уникальность
    if (dto.asin) {
      const existing = await this.prisma.product.findUnique({
        where: { asin: dto.asin },
      });
      if (existing && existing.id !== id) {
        const error = new ConflictException(
          'Товар с таким ASIN уже существует',
        );
        (error as any).fieldErrors = {
          asin: 'Товар с таким ASIN уже существует',
        };
        throw error;
      }
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          name: dto.name,
          categoryId: dto.categoryId,
          condition: dto.condition,
          purchasePrice: dto.purchasePrice,
          salePrice: dto.salePrice,
          cellId: dto.cellId,
          ean: dto.ean,
          asin: dto.asin,
          images: dto.images,
          customFields: dto.customFields as Prisma.InputJsonValue | undefined,
          showcaseStatuses: dto.showcaseStatuses as
            | Prisma.InputJsonValue
            | undefined,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          const target = (e.meta?.target as string[]) ?? [];
          if (target.includes('ean')) {
            throw new ConflictException('Товар с таким EAN уже существует');
          }
          if (target.includes('asin')) {
            throw new ConflictException('Товар с таким ASIN уже существует');
          }
        }
      }
      throw e;
    }
  }

  async transitionStatus(id: string) {
    const product = await this.findById(id);
    const current = product.status as ProductStatus;
    const allowed = ALLOWED_TRANSITIONS[current];

    if (allowed.length === 0) {
      throw new BadRequestException(
        `Переход из статуса «${STATUS_LABELS[current]}» невозможен`,
      );
    }

    // Автоматический переход по единственному доступному пути (если их несколько — берём первый)
    const next = allowed[0];

    return this.prisma.product.update({
      where: { id },
      data: { status: next },
    });
  }

  async delete(id: string) {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(
        (error as Error).message || 'Товар не найден',
      );
    }
  }

  getAvailableTransitions(status: ProductStatus): ProductStatus[] {
    return ALLOWED_TRANSITIONS[status] ?? [];
  }

  getStatusLabel(status: ProductStatus): string {
    return STATUS_LABELS[status] ?? status;
  }
}
