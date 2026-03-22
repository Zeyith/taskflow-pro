import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedUser } from '../../modules/auth/strategies/jwt.strategy';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthorizationError } from '../exceptions/authorization.exception';
import type { UserRole } from '../types/user-role.type';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new AuthorizationError('User context is missing');
    }

    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      throw new AuthorizationError(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}

//Giriş yapmış ama bu sayfaya yetkisi var mı?
