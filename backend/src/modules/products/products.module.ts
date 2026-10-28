import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller.js';
import { ProductsApiController } from './controllers/products-api.controller.js';
import { ProductsService } from './services/products.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';
import { CategoriesModule } from '../categories/categories.module.js';
import { CellsModule } from '../cells/cells.module.js';

@Module({
  imports: [CategoriesModule, CellsModule],
  controllers: [ProductsController, ProductsApiController],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule {}
