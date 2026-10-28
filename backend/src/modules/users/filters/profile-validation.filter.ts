import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch(BadRequestException)
export class ProfileValidationFilter implements ExceptionFilter {
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

    // Known DTO fields for matching in string messages
    const dtoFields = [
      'userName',
      'displayName',
      'email',
      'password',
      'confirmPassword',
    ];

    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(validationErrors)) {
      for (const msg of validationErrors) {
        if (typeof msg === 'object' && msg !== null && 'property' in msg) {
          // Standard NestJS ValidationError object
          const constraints = (msg as { constraints?: Record<string, string> })
            .constraints;
          if (constraints) {
            const firstKey = Object.keys(constraints)[0];
            fieldErrors[(msg as { property: string }).property] =
              constraints[firstKey];
          }
          continue;
        }
        if (typeof msg === 'string') {
          const parts = msg.split(':');
          if (parts.length >= 2) {
            // Format: "fieldName: error message"
            fieldErrors[parts[0].trim()] = parts.slice(1).join(':').trim();
            continue;
          }
          // Try to match known DTO fields in the message
          const lowerMsg = msg.toLowerCase();
          const matched = dtoFields.find((f) =>
            lowerMsg.includes(f.toLowerCase()),
          );
          if (matched) {
            fieldErrors[matched] = msg;
          }
        }
      }
    }
    // Also handle case where message is a single string
    if (
      typeof validationErrors === 'string' &&
      Object.keys(fieldErrors).length === 0
    ) {
      const lowerMsg = validationErrors.toLowerCase();
      const matched = dtoFields.find((f) => lowerMsg.includes(f.toLowerCase()));
      if (matched) {
        fieldErrors[matched] = validationErrors;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (req as any).session;
    if (session) {
      if (
        Object.keys(fieldErrors).length === 0 &&
        Array.isArray(validationErrors)
      ) {
        const errorText = validationErrors.join('; ');
        session.profileFlash = {
          error: errorText,
          errors: {},
          old: { ...body },
        };
      } else {
        session.profileFlash = {
          error: null,
          errors: fieldErrors,
          old: { ...body },
        };
      }
      session.save((err: any) => {
        if (err) console.error('Session save error:', err);
        res.redirect('/warehouse/profile');
      });
      return;
    }

    return res.redirect('/warehouse/profile');
  }
}
