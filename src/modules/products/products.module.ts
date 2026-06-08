import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller.js';
import { ProductsService } from './services/products.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule {}
