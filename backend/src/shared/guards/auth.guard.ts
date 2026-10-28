import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (req.session?.user) {
      return true;
    }

    res.redirect('/auth/login');
    return false;
  }
}
