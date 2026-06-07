import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Render,
  Redirect,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductStatus } from '../entities/product-status.enum.js';

@Controller('warehouse/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Render('warehouse/catalog-list')
  async list(@Query('page') page?: string) {
    const result = await this.productsService.findAll(Number(page) || 1);
    return {
      title: 'Каталог товаров',
      ...result,
      statusLabels: (s: ProductStatus) =>
        this.productsService.getStatusLabel(s),
    };
  }

  @Get('create')
  @Render('warehouse/product-create')
  createForm() {
    return { title: 'Новый товар' };
  }

  @Post()
  @Redirect('/warehouse/products')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateProductDto) {
    await this.productsService.create(dto);
    return {};
  }

  @Get(':id')
  @Render('warehouse/product-card')
  async card(@Param('id') id: string) {
    const product = await this.productsService.findById(+id);
    const transitions = this.productsService.getAvailableTransitions(
      product.status as ProductStatus,
    );
    return {
      title: product.name,
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
    await this.productsService.update(+id, dto);
    return { url: `/warehouse/products/${id}` };
  }

  @Post(':id/transition')
  @Redirect('/warehouse/products/:id')
  async transition(@Param('id') id: string) {
    await this.productsService.transitionStatus(+id);
    return {};
  }
}
