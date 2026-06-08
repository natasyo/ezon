import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../tools/prisma/prisma.service.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async get(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  async setMany(entries: { key: string; value: string }[]) {
    await Promise.all(
      entries.map(({ key, value }) =>
        this.prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value, label: key },
        }),
      ),
    );
  }
}
