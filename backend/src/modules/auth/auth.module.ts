import { Module } from '@nestjs/common';
import { AuthApiController } from './controllers/auth-api.controller.js';
import { AuthService } from './services/auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthApiController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
