import { Module } from '@nestjs/common';
import { SettingsApiController } from './controllers/settings.api.controller.js';
import { SettingsService } from './services/settings.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  controllers: [SettingsApiController],
  providers: [SettingsService, PrismaService],
  exports: [SettingsService],
})
export class SettingsModule {}
