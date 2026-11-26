import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

interface AdminRequest extends Request {
  user?: {
    role: string;
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AdminRequest>();

    if (request.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Wymagane są uprawnienia administratora',
      );
    }

    return true;
  }
}
