import { Module } from '@nestjs/common';
import { SettingsController } from './controllers/settings.controller.js';
import { SettingsService } from './services/settings.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService],
  exports: [SettingsService],
})
export class SettingsModule {}
