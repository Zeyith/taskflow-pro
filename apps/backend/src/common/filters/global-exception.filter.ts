import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodError } from 'zod';

import { AppConfig } from '../configs/app.config';
import { BaseAppException } from '../exceptions/base-app.exception';
import type { RequestWithId } from '../interfaces/request-with-id.interface';

type ErrorResponseBody = {
  type: string;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  statusCode: number;
  requestId: string | null;
  stack?: string;
};

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly appConfig: AppConfig) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const timestamp = new Date().toISOString();
    const path = request.originalUrl;
    const requestId = request.requestId ?? null;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let type = 'InternalServerError';
    let error = 'INTERNAL_SERVER_ERROR';
    let message = 'Unexpected server error';
    let stack: string | undefined;

    if (exception instanceof BaseAppException) {
      statusCode = exception.statusCode;
      type = exception.type;
      error = exception.error;
      message = exception.message;
      stack = exception.stack;
    } else if (exception instanceof ZodError) {
      statusCode = HttpStatus.BAD_REQUEST;
      type = 'ValidationError';
      error = 'VALIDATION_ERROR';
      message = this.extractZodErrorMessage(exception);
      stack = exception.stack;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      type = 'HttpException';
      error = 'HTTP_EXCEPTION';
      message = this.extractHttpExceptionMessage(exception);
      stack = exception.stack;
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      type = exception.name || 'InternalServerError';
      error = 'INTERNAL_SERVER_ERROR';
      message = exception.message || 'Unexpected server error';
      stack = exception.stack;
    }

    const errorResponse: ErrorResponseBody = {
      type,
      error,
      message,
      timestamp,
      path,
      statusCode,
      requestId,
    };

    if (!this.appConfig.isProduction && stack) {
      errorResponse.stack = stack;
    }

    const errorLogPayload = {
      level: 'error',
      message: 'HTTP request failed',
      timestampUtc: timestamp,
      requestId,
      method: request.method,
      path,
      statusCode,
      error,
      exceptionType: type,
      exceptionMessage: message,
    };

    console.error(JSON.stringify(errorLogPayload));

    response.status(statusCode).json(errorResponse);
  }

  private extractHttpExceptionMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = (exceptionResponse as { message: unknown }).message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return exception.message;
  }

  private extractZodErrorMessage(exception: ZodError): string {
    return exception.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'request';
        return `${path}: ${issue.message}`;
      })
      .join(', ');
  }
}
//instanceof bir objenin hangi class’tan üretildiğini kontrol eder.

/*
GlobalExceptionFilter, uygulamadaki tüm hataları yakalayan 
son katmandır ve onları standart JSON formatına çevirir.
BaseAppException ise bizim tanımladığımız hataların tipini 
ve yapısını belirleyen temel sınıftır, böylece filter onları 
kolayca tanıyıp doğru response üretir.
*/
/*
Neden throw new Error() yerine throw new NotFoundError() 
gibi hatalar kullanıyoruz?

Çünkü Error kullanırsak hata tipi ve status code kaybolur.
*/
