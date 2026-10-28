import { Module } from '@nestjs/common';
import { PalletsController } from './controllers/pallets.controller.js';
import { PalletImportService } from './services/pallet-import.service.js';
import { ImageDownloadService } from './services/image-download.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service.js';

@Module({
  controllers: [PalletsController],
  providers: [PalletImportService, ImageDownloadService, PrismaService],
})
export class PalletsModule {}
