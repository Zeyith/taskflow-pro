import { BaseAppException } from './base-app.exception';

export class AuthenticationError extends BaseAppException {
  constructor(message = 'Authentication required') {
    super('AuthenticationError', 'AUTHENTICATION_ERROR', message, 401);
  }
}
