import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register.dto';
import { PrismaService } from '../../../tools/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prismaService: PrismaService) {}

  async create(data: RegisterDto) {
    const existing = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: data.email }, { userName: data.userName }],
      },
    });

    if (existing) {
      throw new ConflictException('Email или userName уже занят');
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await this.prismaService.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        userName: data.userName,
        displayName: data.displayName,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({ where: { id } });
  }
  async findAll() {
    return this.prismaService.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        userName: true,
        displayName: true,
        role: true,
        isDeactivated: true,
        createdAt: true,
      },
    });
  }

  async updateUser(
    id: string,
    data: {
      email?: string;
      userName?: string;
      displayName?: string;
      role?: string;
    },
  ) {
    const { role, ...rest } = data;
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');
    return this.prismaService.user.update({
      where: { id },
      data: {
        ...rest,
        ...(role && { role: role as UserRole }),
      },
      select: {
        id: true,
        email: true,
        userName: true,
        displayName: true,
        role: true,
      },
    });
  }

  async deactivate(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');
    return this.prismaService.user.update({
      where: { id },
      data: { isDeactivated: true, deactivatedAt: new Date() },
      select: { id: true, isDeactivated: true },
    });
  }

  async reactivate(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');
    return this.prismaService.user.update({
      where: { id },
      data: { isDeactivated: false, deactivatedAt: null },
      select: { id: true, isDeactivated: true },
    });
  }
}
