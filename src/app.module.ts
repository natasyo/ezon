import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AppController],
})
export class AppModule {}
