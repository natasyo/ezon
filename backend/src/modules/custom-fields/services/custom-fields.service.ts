import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../tools/prisma/prisma.service.js';
import { CreateCustomFieldDto } from '../dto/create-custom-field.dto.js';
import { UpdateCustomFieldDto } from '../dto/update-custom-field.dto.js';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.customFieldConfig.findMany({
      orderBy: { createdAt: 'asc' },
      include: { category: true },
    });
  }

  async findById(id: string) {
    const config = await this.prisma.customFieldConfig.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!config) throw new NotFoundException('Поле не найдено');
    return config;
  }

  async create(dto: CreateCustomFieldDto) {
    const existing = await this.prisma.customFieldConfig.findUnique({
      where: {
        key_categoryId: {
          key: dto.key,
          categoryId: dto.categoryId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Поле с таким ключом уже существует в этой категории');
    }
    return this.prisma.customFieldConfig.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateCustomFieldDto) {
    const config = await this.findById(id);
    if (dto.key !== undefined && dto.categoryId !== undefined) {
      const existing = await this.prisma.customFieldConfig.findUnique({
        where: {
          key_categoryId: {
            key: dto.key,
            categoryId: dto.categoryId,
          },
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Поле с таким ключом уже существует в этой категории');
      }
    }
    return this.prisma.customFieldConfig.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.customFieldConfig.delete({ where: { id } });
  }
}
