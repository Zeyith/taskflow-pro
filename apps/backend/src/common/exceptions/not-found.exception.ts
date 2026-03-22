import { BaseAppException } from './base-app.exception';

export class NotFoundError extends BaseAppException {
  constructor(message: string) {
    super('NotFoundError', 'NOT_FOUND', message, 404);
  }
}
