import { BaseAppException } from './base-app.exception';

export class AuthorizationError extends BaseAppException {
  constructor(message = 'Forbidden') {
    super('AuthorizationError', 'AUTHORIZATION_ERROR', message, 403);
  }
}
