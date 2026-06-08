import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { PrismaModule } from './tools/prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    SettingsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
