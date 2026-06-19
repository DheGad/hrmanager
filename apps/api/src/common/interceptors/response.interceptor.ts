import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PageDto } from '../dto/pagination.dto';

export interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  success: true;
  statusCode: number;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  timestamp: string;
  requestId: string;
}

/**
 * Wraps every successful HTTP response in a consistent envelope.
 *
 * Detects PageDto instances and expands them into a paginated envelope with
 * a `meta` block. All other responses are wrapped in the standard success
 * envelope.
 *
 * The response interceptor is intentionally lightweight — it must not perform
 * any I/O or side effects. Those belong in the AuditInterceptor.
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T> | PaginatedResponse<unknown>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T> | PaginatedResponse<unknown>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request & { requestId?: string }>();
    const response = httpContext.getResponse<{ statusCode: number }>();

    const requestId = request.requestId ?? 'N/A';

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode ?? 200;
        const timestamp = new Date().toISOString();

        // ── Paginated response (PageDto instance) ────────────────────────────
        if (data instanceof PageDto) {
          const page = data as PageDto<unknown>;
          return {
            success: true as const,
            statusCode,
            data: page.data,
            meta: {
              total: page.meta.total,
              page: page.meta.page,
              limit: page.meta.limit,
              totalPages: page.meta.totalPages,
              hasPreviousPage: page.meta.hasPreviousPage,
              hasNextPage: page.meta.hasNextPage,
            },
            timestamp,
            requestId,
          } satisfies PaginatedResponse<unknown>;
        }

        // ── Standard response ────────────────────────────────────────────────
        return {
          success: true as const,
          statusCode,
          data,
          timestamp,
          requestId,
        } satisfies SuccessResponse<T>;
      }),
    );
  }
}
