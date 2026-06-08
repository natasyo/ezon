import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller.js';
import { AdminUsersController } from './controllers/admin-users.controller.js';
import { UsersService } from './services/users.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
