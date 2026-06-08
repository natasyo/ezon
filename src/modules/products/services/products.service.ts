import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../tools/prisma/prisma.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductStatus } from '../entities/product-status.enum.js';

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

  async findAll(page = 1, pageSize = 50) {
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: { category: true },
      }),
      this.prisma.product.count(),
    ]);
    return { data, total, page, pageSize };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { createdBy: true, category: true },
    });
    if (!product) throw new NotFoundException('Товар не найден');
    return product;
  }

  async create(dto: CreateProductDto, createdById?: string) {
    return this.prisma.product.create({
      data: {
        sku: dto.sku,
        ean: dto.ean,
        asin: dto.asin,
        name: dto.name,
        categoryId: dto.categoryId,
        condition: dto.condition,
        purchasePrice: dto.purchasePrice ?? 0,
        salePrice: dto.salePrice ?? 0,
        cell: dto.cell,
        arrivalDate: dto.arrivalDate ? new Date(dto.arrivalDate) : null,
        images: dto.images ?? [],
        customFields: (dto.customFields ?? {}) as Prisma.InputJsonValue,
        showcaseStatuses: (dto.showcaseStatuses ?? {}) as Prisma.InputJsonValue,
        ...(createdById && { createdById }),
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    // Идентификаторы (id, sku, ean, asin) не входят в DTO — защищены от изменения
    await this.findById(id); // проверить существование
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        condition: dto.condition,
        purchasePrice: dto.purchasePrice,
        salePrice: dto.salePrice,
        cell: dto.cell,
        images: dto.images,
        customFields: dto.customFields as Prisma.InputJsonValue | undefined,
        showcaseStatuses: dto.showcaseStatuses as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
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

  getAvailableTransitions(status: ProductStatus): ProductStatus[] {
    return ALLOWED_TRANSITIONS[status] ?? [];
  }

  getStatusLabel(status: ProductStatus): string {
    return STATUS_LABELS[status] ?? status;
  }
}
