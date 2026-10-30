import { Module } from '@nestjs/common';
import { UsersApiController } from './controllers/users.api.controller.js';
import { EmployeesApiController } from './controllers/employees.api.controller.js';
import { UsersService } from './services/users.service.js';
import { PrismaService } from '../../tools/prisma/prisma.service';

@Module({
  controllers: [UsersApiController, EmployeesApiController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
