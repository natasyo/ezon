import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Session,
  Res,
  Render,
  Redirect,
  UseGuards,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { SearchProductDto } from '../dto/search-product.dto.js';
import { BulkUpdateDto } from '../dto/bulk-update.dto.js';
import { ProductStatus } from '../entities/product-status.enum.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';
import { CategoriesService } from '../../categories/services/categories.service.js';
import { CellsService } from '../../cells/services/cells.service.js';

@Controller('warehouse/products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly cellsService: CellsService,
  ) {}

  @Get()
  @Render('warehouse/catalog-list')
  async list(
    @Query() query: SearchProductDto,
    @Session() session?: Record<string, any>,
  ) {
    const [result, categories, cells] = await Promise.all([
      this.productsService.findAll(query),
      this.categoriesService.findAll(),
      this.cellsService.findAll(),
    ]);
    return {
      title: 'Каталог товаров',
      user: session?.user ?? null,
      ...result,
      categories,
      cells,
      filters: {
        search: query.search || '',
        sku: query.sku || '',
        ean: query.ean || '',
        asin: query.asin || '',
        condition: query.condition || '',
        status: query.status || '',
        cell: query.cellId || '',
        categoryId: query.categoryId || '',
      },
      statuses: [
        { value: 'ARRIVAL', label: 'Поступление' },
        { value: 'IN_STOCK', label: 'На складе' },
        { value: 'PLACED', label: 'Размещён' },
        { value: 'SOLD', label: 'Продан' },
        { value: 'WRITTEN_OFF', label: 'Списан' },
      ],
      statusLabels: (s: ProductStatus) =>
        this.productsService.getStatusLabel(s),
    };
  }

  @Get('create')
  @Render('warehouse/product-create')
  createForm(@Session() session?: Record<string, any>) {
    const flash = session?.productFlash;
    // Очищаем flash после прочтения
    if (session) {
      delete session.productFlash;
    }
    return {
      title: 'Новый товар',
      user: session?.user ?? null,
      flash: flash || null,
    };
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateProductDto,
    @Session() session?: Record<string, any>,
    @Res() res?: Response,
  ) {
    try {
      await this.productsService.create(dto, session?.user?.id);
      return res?.redirect('/warehouse/products');
    } catch (err: any) {
      let errorMessage: string | null = null;
      const fieldErrors: Record<string, string> = {};

      // Сначала проверяем fieldErrors от сервиса (например, дубликат уникальных полей)
      if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        Object.assign(fieldErrors, err.fieldErrors);
        errorMessage =
          err.fieldErrors[Object.keys(err.fieldErrors)[0]] || 'Ошибка';
      } else if (err instanceof BadRequestException) {
        const response = err.getResponse();
        const msg =
          typeof response === 'object' &&
          response !== null &&
          'message' in response
            ? (response as { message: unknown }).message
            : null;
        if (typeof msg === 'string') {
          errorMessage = msg;
        } else if (Array.isArray(msg)) {
          errorMessage = msg.join('; ');
        } else {
          errorMessage = 'Ошибка валидации';
        }
      } else if (
        err?.response?.message &&
        Array.isArray(err.response.message)
      ) {
        // Ошибки валидации от ValidationPipe
        for (const msg of err.response.message) {
          if (typeof msg === 'string') {
            const fieldName = msg.split(' ')[0];
            if (fieldName && fieldName in (dto as any)) {
              fieldErrors[fieldName] = msg;
            } else if (!errorMessage) {
              errorMessage = msg;
            }
          }
        }
      } else {
        errorMessage = 'Произошла ошибка при создании товара';
      }

      // Рендерим форму с ошибками без редиректа
      return res?.render('warehouse/product-create', {
        title: 'Новый товар',
        user: session?.user ?? null,
        flash: {
          error: errorMessage,
          errors: fieldErrors,
          old: dto as unknown as Record<string, string>,
        },
      });
    }
  }

  @Get(':id')
  @Render('warehouse/product-card')
  async card(
    @Param('id') id: string,
    @Session() session?: Record<string, any>,
  ) {
    const product = await this.productsService.findById(id);
    const transitions = this.productsService.getAvailableTransitions(
      product.status as ProductStatus,
    );
    return {
      title: product.name,
      user: session?.user ?? null,
      product,
      transitions,
      statusLabel: this.productsService.getStatusLabel.bind(
        this.productsService,
      ),
    };
  }

  @Post('bulk')
  @Redirect('/warehouse/products')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkUpdate(@Body() dto: BulkUpdateDto) {
    await this.productsService.bulkUpdate(dto);
    return {};
  }

  @Post(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Res() res: Response,
  ) {
    await this.productsService.update(id, dto);
    return res.redirect(`/warehouse/products/${id}`);
  }

  @Post(':id/transition')
  async transition(@Param('id') id: string, @Res() res: Response) {
    await this.productsService.transitionStatus(id);
    return res.redirect(`/warehouse/products/${id}`);
  }
}
