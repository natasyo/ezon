import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller.js';
import { CategoriesService } from './services/categories.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService],
})
export class CategoriesModule {}
