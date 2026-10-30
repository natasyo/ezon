import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiAuthGuard } from '../../../shared/guards/api-auth.guard.js';
import { SettingsService } from '../services/settings.service.js';

@Controller('api/settings')
@UseGuards(ApiAuthGuard)
export class SettingsApiController {
  constructor(private readonly settingsService: SettingsService) {}

  private toMap(settings: { key: string; value: string }[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return map;
  }

  @Get()
  async list() {
    const settings = await this.settingsService.getAll();
    return this.toMap(settings);
  }

  @Put()
  async save(@Body() body: Record<string, string>) {
    const entries = Object.entries(body)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => ({ key, value }));
    await this.settingsService.setMany(entries);
    const settings = await this.settingsService.getAll();
    return this.toMap(settings);
  }
}
