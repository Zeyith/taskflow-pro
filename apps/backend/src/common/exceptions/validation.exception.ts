import { BaseAppException } from './base-app.exception';

export class ValidationError extends BaseAppException {
  constructor(message: string) {
    super('ValidationError', 'VALIDATION_ERROR', message, 400);
  }
}

//super = üst class'ı çalıştırmak
