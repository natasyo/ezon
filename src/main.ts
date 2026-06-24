import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import pg from 'pg';
import { AppModule } from './app.module.js';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      userName: string;
      displayName: string | null;
    };
    loginFlash?: {
      error?: string | null;
      errors?: Record<string, string>;
      old?: { email: string };
    };
    registerFlash?: {
      error?: string | null;
      errors?: Record<string, string>;
      old?: { userName: string; displayName?: string; email: string };
    };
    employeeFlash?: {
      success?: string;
      error?: string | null;
      errors?: Record<string, string>;
      old?: Record<string, string>;
    };
    profileFlash?: {
      success?: string;
      error?: string | null;
      errors?: Record<string, string>;
    };
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Trust reverse proxy (nginx) for HTTPS detection
  app.set('trust proxy', 1);

  const isProduction = config.get<string>('NODE_ENV') === 'production';

  // PostgreSQL session store
  const pgPool = new pg.Pool({
    connectionString: config.getOrThrow<string>('DATABASE_URL'),
  });

  const PgStore = pgSession(session);

  app.use(
    session({
      store: new PgStore({
        pool: pgPool,
        createTableIfMissing: true,
        tableName: 'user_sessions',
      }),
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
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
