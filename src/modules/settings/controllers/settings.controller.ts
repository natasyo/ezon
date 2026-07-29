import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Redirect,
  UseGuards,
  Session,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service.js';
import { AuthGuard } from '../../../shared/guards/auth.guard.js';

@Controller('warehouse/settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiExcludeEndpoint()
  @Render('settings/index')
  async index(@Session() session?: Record<string, any>) {
    const settings = await this.settingsService.getAll();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return { title: 'Настройки', user: session?.user ?? null, settings: map };
  }

  @Post()
  @ApiExcludeEndpoint()
  @Redirect('/warehouse/settings')
  async save(@Body() body: Record<string, string>) {
    const entries = Object.entries(body)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => ({ key, value }));
    await this.settingsService.setMany(entries);
    return {};
  }
}
