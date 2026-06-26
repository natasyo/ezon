import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register.dto';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { ProfileDto } from '../dto/profile.dto';
import { PrismaService } from '../../../tools/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prismaService: PrismaService) {}

  async create(data: RegisterDto) {
    const errors: Record<string, string> = {};

    const existingEmail = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      errors.email = 'Пользователь с таким email уже существует';
    }

    const existingUserName = await this.prismaService.user.findUnique({
      where: { userName: data.userName },
    });
    if (existingUserName) {
      errors.userName = 'Пользователь с таким именем уже существует';
    }

    if (Object.keys(errors).length > 0) {
      throw new ConflictException(errors);
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

  async createEmployee(data: CreateEmployeeDto) {
    const errors: Record<string, string> = {};

    const existingEmail = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      errors.email = 'Пользователь с таким email уже существует';
    }

    const existingUserName = await this.prismaService.user.findUnique({
      where: { userName: data.userName },
    });
    if (existingUserName) {
      errors.userName = 'Пользователь с таким именем уже существует';
    }

    if (Object.keys(errors).length > 0) {
      throw new ConflictException(errors);
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await this.prismaService.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        userName: data.userName,
        displayName: data.displayName,
        role: data.role ?? UserRole.EMPLOYEE,
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

  async findAll(search?: string) {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prismaService.user.findMany({
      where,
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

  async updateUser(id: string, data: UpdateEmployeeDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');

    const { password, confirmPassword, role, ...rest } = data;

    const updateData: Record<string, unknown> = { ...rest };
    if (role) {
      updateData.role = role as UserRole;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        userName: true,
        displayName: true,
        role: true,
      },
    });
  }

  async updateProfile(id: string, data: ProfileDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');

    const errors: Record<string, string> = {};

    if (data.email && data.email !== user.email) {
      const existingEmail = await this.prismaService.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        errors.email = 'Пользователь с таким email уже существует';
      }
    }

    if (data.userName && data.userName !== user.userName) {
      const existingUserName = await this.prismaService.user.findUnique({
        where: { userName: data.userName },
      });
      if (existingUserName) {
        errors.userName = 'Пользователь с таким именем уже существует';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ConflictException(errors);
    }

    const { password, confirmPassword, ...rest } = data;

    const updateData: Record<string, unknown> = { ...rest };
    if (password) {
      updateData.password = await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateData,
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
