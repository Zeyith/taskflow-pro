export type AppErrorType =
  | 'ValidationError'
  | 'AuthenticationError'
  | 'AuthorizationError'
  | 'NotFoundError'
  | 'BusinessRuleError';

export class BaseAppException extends Error {
  public readonly type: AppErrorType;
  public readonly error: string;
  public readonly statusCode: number;

  constructor(
    type: AppErrorType,
    error: string,
    message: string,
    statusCode: number,
  ) {
    super(message);

    this.type = type;
    this.error = error;
    this.statusCode = statusCode;
  }
}
