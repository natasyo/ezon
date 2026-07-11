import { Module } from '@nestjs/common';
import { CellsController } from './controllers/cells.controller.js';
import { CellsService } from './services/cells.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service.js';

@Module({
  controllers: [CellsController],
  providers: [CellsService, PrismaService],
  exports: [CellsService],
})
export class CellsModule {}
