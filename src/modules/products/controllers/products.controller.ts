import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Session,
  Render,
  Redirect,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductStatus } from '../entities/product-status.enum.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';

@Controller('warehouse/products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Render('warehouse/catalog-list')
  async list(
    @Query('page') page?: string,
    @Session() session?: Record<string, any>,
  ) {
    const result = await this.productsService.findAll(Number(page) || 1);
    return {
      title: 'Каталог товаров',
      user: session?.user ?? null,
      ...result,
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
  @UsePipes(new ValidationPipe({ transform: true }))
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

  @Post(':id')
  @Redirect('/warehouse/products/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    await this.productsService.update(id, dto);
    return { url: `/warehouse/products/${id}` };
  }

  @Post(':id/transition')
  @Redirect('/warehouse/products/:id')
  async transition(@Param('id') id: string) {
    await this.productsService.transitionStatus(id);
    return {};
  }
}
