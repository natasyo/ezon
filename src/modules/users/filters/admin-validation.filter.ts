import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch(BadRequestException)
export class AdminValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const body = req.body ?? {};
    const url = req.url;

    // Determine redirect URL based on the request path
    let redirectUrl = '/warehouse/users';

    if (url.includes('/create')) {
      redirectUrl = '/warehouse/users/create';
    } else {
      // Extract ID from URL like /warehouse/users/123
      const match = url.match(/\/warehouse\/users\/([^/]+)/);
      if (match && match[1] && match[1] !== 'create') {
        redirectUrl = `/warehouse/users/${match[1]}/edit`;
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
          // Simple string message — extract field if possible
          const parts = msg.split(':');
          if (parts.length >= 2) {
            fieldErrors[parts[0].trim()] = parts.slice(1).join(':').trim();
          }
          continue;
        }
        if (typeof msg === 'object' && msg !== null && 'property' in msg) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (req as any).session;
    if (session) {
      if (
        Object.keys(fieldErrors).length === 0 &&
        Array.isArray(validationErrors)
      ) {
        // If we couldn't parse field errors, put all messages as a general error
        const errorText = validationErrors.join('; ');
        session.employeeFlash = {
          error: errorText,
          errors: {},
          old: { ...body },
        };
      } else {
        session.employeeFlash = {
          error: null,
          errors: fieldErrors,
          old: { ...body },
        };
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
