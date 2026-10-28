import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch(BadRequestException)
export class CategoriesValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const body = (req as any).body ?? {};
    const url = req.url;

    let redirectUrl = '/warehouse/categories';
    if (url.includes('/create') || url === '/' || url === '') {
      redirectUrl = '/warehouse/categories/create';
    } else {
      const match = url.match(/\/warehouse\/categories\/([^/]+)/);
      if (match && match[1] && match[1] !== 'create') {
        redirectUrl = `/warehouse/categories/${match[1]}/edit`;
      }
    }

    const response = exception.getResponse();
    const validationErrors =
      typeof response === 'object' && response !== null && 'message' in response
        ? (response as { message: unknown }).message
        : null;

    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(validationErrors)) {
      for (const msg of validationErrors) {
        if (typeof msg === 'string') {
          const parts = msg.split(':');
          if (parts.length >= 2) {
            fieldErrors[parts[0].trim()] = parts.slice(1).join(':').trim();
          }
          continue;
        }
        if (typeof msg === 'object' && msg && 'property' in msg) {
          const constraints = (msg as { constraints?: Record<string, string> })
            .constraints;
          if (constraints) {
            const firstKey = Object.keys(constraints)[0];
            fieldErrors[(msg as { property: string }).property] =
              constraints[firstKey];
          }
        }
      }
    }

    const session = (req as any).session;
    if (session) {
      if (Object.keys(fieldErrors).length === 0 && Array.isArray(validationErrors)) {
        const errorText = validationErrors.join('; ');
        session.categoryFlash = { error: errorText, errors: {}, old: { ...body } };
      } else {
        session.categoryFlash = { error: null, errors: fieldErrors, old: { ...body } };
      }
      session.save((err: any) => {
        if (err) console.error('Session save error:', err);
        res.redirect(redirectUrl);
      });
      return;
    }

    return res.redirect(redirectUrl);
  }
}
