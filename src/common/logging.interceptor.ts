import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

// Logs method, path, status and duration only: never bodies or headers.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();

    const log = (status: number) =>
      this.logger.log(
        `${req.method} ${req.originalUrl} ${status} - ${Date.now() - start}ms`,
      );

    return next.handle().pipe(
      tap({
        next: () => log(res.statusCode),
        error: (err: unknown) =>
          log(err instanceof HttpException ? err.getStatus() : 500),
      }),
    );
  }
}
