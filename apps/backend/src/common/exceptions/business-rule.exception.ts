import { BaseAppException } from './base-app.exception';

export class BusinessRuleError extends BaseAppException {
  constructor(message: string) {
    super('BusinessRuleError', 'BUSINESS_RULE_ERROR', message, 400);
  }
}
