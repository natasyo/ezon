import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../tools/prisma/prisma.service.js';
import { CreateCellDto } from '../dto/create-cell.dto.js';
import { UpdateCellDto } from '../dto/update-cell.dto.js';

@Injectable()
export class CellsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cell.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async findById(id: string) {
    const cell = await this.prisma.cell.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!cell) throw new NotFoundException('Ячейка не найдена');
    return cell;
  }

  async create(dto: CreateCellDto) {
    const existing = await this.prisma.cell.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Ячейка с таким названием уже существует');
    }
    return this.prisma.cell.create({ data: dto });
  }

  async update(id: string, dto: UpdateCellDto) {
    await this.findById(id);
    return this.prisma.cell.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.cell.delete({ where: { id } });
  }
}
