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
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { SearchProductDto } from '../dto/search-product.dto.js';
import { BulkUpdateDto } from '../dto/bulk-update.dto.js';
import { ProductStatus } from '../entities/product-status.enum.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';

@Controller('warehouse/products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Render('warehouse/catalog-list')
  async list(
    @Query() query: SearchProductDto,
    @Session() session?: Record<string, any>,
  ) {
    const result = await this.productsService.findAll(query);
    return {
      title: 'Каталог товаров',
      user: session?.user ?? null,
      ...result,
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
    return { title: 'Новый товар', user: session?.user ?? null };
  }

  @Post()
  @Redirect('/warehouse/products')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateProductDto,
    @Session() session?: Record<string, any>,
  ) {
    await this.productsService.create(dto, session?.user?.id);
    return {};
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
