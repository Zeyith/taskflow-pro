import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import type { RequestWithId } from '../interfaces/request-with-id.interface';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithId>();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;

        const logPayload = {
          level: 'info',
          message: 'HTTP request completed',
          timestampUtc: new Date().toISOString(),
          requestId: request.requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs,
        };

        console.log(JSON.stringify(logPayload));
      }),
    );
  }
}
