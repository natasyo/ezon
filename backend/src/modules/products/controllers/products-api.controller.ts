import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../../../shared/guards/api-auth.guard.js';
import { ProductsService } from '../services/products.service.js';
import { SearchProductDto } from '../dto/search-product.dto.js';

@Controller('api/products')
@UseGuards(ApiAuthGuard)
export class ProductsApiController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query: SearchProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }
}
