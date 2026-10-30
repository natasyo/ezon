import { Module } from '@nestjs/common';
import { CustomFieldsApiController } from './controllers/custom-fields.api.controller.js';
import { CustomFieldsService } from './services/custom-fields.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service.js';

@Module({
  controllers: [CustomFieldsApiController],
  providers: [CustomFieldsService, PrismaService],
})
export class CustomFieldsModule {}
