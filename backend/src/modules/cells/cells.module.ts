import { Module } from '@nestjs/common';
import { CellsApiController } from './controllers/cells.api.controller.js';
import { CellsService } from './services/cells.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service.js';

@Module({
  controllers: [CellsApiController],
  providers: [CellsService, PrismaService],
  exports: [CellsService],
})
export class CellsModule {}
