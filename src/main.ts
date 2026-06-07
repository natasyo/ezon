import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import session from 'express-session';
import { AppModule } from './app.module.js';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      userName: string;
      displayName: string | null;
    };
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Trust reverse proxy (nginx) for HTTPS detection
  app.set('trust proxy', 1);

  const isProduction = config.get<string>('NODE_ENV') === 'production';

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'views'));
  app.setViewEngine('ejs');

  const port = config.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`Ezon running on http://localhost:${port}`);
}

void bootstrap();
