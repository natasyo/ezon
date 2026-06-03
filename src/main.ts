import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import session from 'express-session';
import { AppModule } from './app.module.js';
import { config } from './tools/config/index.js';

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

  app.use(
    session({
      secret: config().session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  const { port } = config();

  await app.listen(port);
  console.log(`Ezon running on http://localhost:${port}`);
}

void bootstrap();
