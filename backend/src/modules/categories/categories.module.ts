import { Module } from '@nestjs/common';
import { CategoriesApiController } from './controllers/categories.api.controller.js';
import { CategoriesService } from './services/categories.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  controllers: [CategoriesApiController],
  providers: [CategoriesService, PrismaService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
