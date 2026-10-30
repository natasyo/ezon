import { Module } from '@nestjs/common';
import { ProductsApiController } from './controllers/products-api.controller.js';
import { ProductsService } from './services/products.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  controllers: [ProductsApiController],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule {}
