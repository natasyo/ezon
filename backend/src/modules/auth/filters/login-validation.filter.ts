import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch(BadRequestException)
export class LoginValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const body = req.body ?? {};

    const response = exception.getResponse();
    const validationErrors =
      typeof response === 'object' && response !== null && 'message' in response
        ? (response as { message: unknown }).message
        : null;

    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(validationErrors)) {
      for (const err of validationErrors) {
        if (typeof err === 'string') continue;
        if (typeof err === 'object' && err !== null && 'property' in err) {
          const constraints = (err as { constraints?: Record<string, string> })
            .constraints;
          if (constraints) {
            const firstKey = Object.keys(constraints)[0];
            fieldErrors[(err as { property: string }).property] =
              constraints[firstKey];
          }
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (req as any).session;
    if (session) {
      session.loginFlash = {
        error: null,
        errors: fieldErrors,
        old: {
          email: typeof body.email === 'string' ? body.email : '',
        },
      };

      session.save((err: any) => {
        if (err) console.error('Session save error:', err);
        res.redirect('/auth/login');
      });
      return;
    }

    return res.redirect('/auth/login');
  }
}
