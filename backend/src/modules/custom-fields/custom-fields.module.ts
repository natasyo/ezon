import { Module } from '@nestjs/common';
import { CustomFieldsController } from './controllers/custom-fields.controller.js';
import { CustomFieldsService } from './services/custom-fields.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service.js';
import { CategoriesModule } from '../categories/categories.module.js';

@Module({
  imports: [CategoriesModule],
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService, PrismaService],
})
export class CustomFieldsModule {}
