import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(BadRequestException)
export class ValidationRedirectFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const message = exception.getResponse();

    const errorText =
      typeof message === 'string'
        ? message
        : typeof message === 'object' &&
            message !== null &&
            'message' in message
          ? Array.isArray((message as { message: unknown }).message)
            ? (message as { message: string[] }).message.join('; ')
            : String((message as { message: unknown }).message)
          : 'Ошибка валидации';

    return res.redirect(
      `/users/register?error=${encodeURIComponent(errorText)}`,
    );
  }
}
