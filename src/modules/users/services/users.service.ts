import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { prisma } from '../../../tools/db/index.js';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  async create(data: {
    email: string;
    password: string;
    userName: string;
    displayName?: string;
  }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { userName: data.userName }],
      },
    });

    if (existing) {
      throw new ConflictException('Email или userName уже занят');
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
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
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }
}
