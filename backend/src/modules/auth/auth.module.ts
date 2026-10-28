import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller.js';
import { AuthApiController } from './controllers/auth-api.controller.js';
import { AuthService } from './services/auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, AuthApiController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
