import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch(BadRequestException)
export class ProductsValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const body = (req as any).body ?? {};
    const url = req.url;

    let redirectUrl = '/warehouse/products';
    if (url.includes('/create') || url === '/' || url === '') {
      redirectUrl = '/warehouse/products/create';
    } else {
      const match = url.match(/\/warehouse\/products\/([^/]+)/);
      if (match && match[1] && match[1] !== 'create') {
        redirectUrl = `/warehouse/products/${match[1]}`;
      }
    }

    let errorMessage: string | null = null;
    const fieldErrors: Record<string, string> = {};

    const response = exception.getResponse();
    const validationErrors =
      typeof response === 'object' && response !== null && 'message' in response
        ? (response as { message: unknown }).message
        : null;

    if (Array.isArray(validationErrors)) {
      for (const msg of validationErrors) {
        if (typeof msg === 'string') {
          // class-validator: "purchasePrice must be a number conforming to the specified constraints"
          const fieldName = msg.split(' ')[0]; // purchasePrice
          // Проверяем, есть ли такое поле в body
          if (fieldName && fieldName in body) {
            fieldErrors[fieldName] = msg;
          } else if (!errorMessage) {
            errorMessage = msg;
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
    } else if (typeof validationErrors === 'string') {
      errorMessage = validationErrors;
    }

    const session = (req as any).session;
    if (session) {
      if (Object.keys(fieldErrors).length > 0) {
        session.productFlash = { error: null, errors: fieldErrors, old: { ...body } };
      } else if (errorMessage) {
        session.productFlash = { error: errorMessage, errors: {}, old: { ...body } };
      } else {
        session.productFlash = { error: 'Ошибка валидации', errors: {}, old: { ...body } };
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
