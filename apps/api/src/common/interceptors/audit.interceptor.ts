import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AUDITED_READ_KEY } from '../decorators/audited-read.decorator';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import type { AuthenticatedUser } from '../types/request.types';

// ── Paths that should never be audit-logged ───────────────────────────────────
const EXCLUDED_PATH_PREFIXES = [
  '/health',
  '/api-docs',
  '/favicon',
  '/metrics',
  '/_next',
  '/static',
];

// ── AI route prefix used to identify AI requests ──────────────────────────────
const AI_PATH_PREFIX = '/api/v1/ai';

// ── Auth-related routes that should be logged even though they are GET/POST ───
const AUTH_PATH_PREFIXES = [
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/register',
  '/api/v1/auth/password',
  '/api/v1/auth/refresh',
];

/**
 * Minimal interface for the AuditService used here.
 * The full AuditService is defined in the AuditModule.
 * Using an interface prevents a circular dependency.
 */
export interface IAuditService {
  createLog(data: {
    userId?: string;
    tenantId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    httpMethod: string;
    httpPath: string;
    httpStatus: number;
    durationMs: number;
  }): Promise<void>;
}

/**
 * DI token for the IAuditService implementation.
 * The AuditModule must provide this token.
 */
export const AUDIT_SERVICE_TOKEN = 'AUDIT_SERVICE';

/**
 * AuditInterceptor
 *
 * Fires after every qualifying HTTP request completes (success or error).
 * Qualifying requests are:
 *  - Any non-GET mutation (POST, PUT, PATCH, DELETE)
 *  - Any request to an AI endpoint (regardless of method)
 *  - Any auth-related request (login, logout, register, password reset)
 *
 * Excluded:
 *  - Health checks, Swagger UI, static assets
 *  - GET requests that are neither AI nor auth routes
 *
 * The interceptor is @Optional() on AuditService to allow the application
 * to start before the AuditModule is fully wired (e.g., during migrations).
 * When AuditService is unavailable, audit logging is silently skipped.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    @Optional()
    private readonly auditService: IAuditService | null,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<
      Request & { requestId?: string; tenantId?: string; user?: AuthenticatedUser }
    >();

    const startTime = Date.now();
    const method = request.method?.toUpperCase() ?? 'UNKNOWN';
    const path = request.path ?? request.url ?? '';

    // ── Fast path: skip excluded routes ──────────────────────────────────────
    if (this.isExcluded(path)) {
      return next.handle();
    }

    // ── Determine if this request should be audited ───────────────────────────
    const isAiRequest = path.startsWith(AI_PATH_PREFIX);
    const isAuthRequest = AUTH_PATH_PREFIXES.some((prefix) =>
      path.startsWith(prefix),
    );
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    
    const auditedReadReason = this.reflector.getAllAndOverride<string>(AUDITED_READ_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isAuditedRead = method === 'GET' && !!auditedReadReason;

    if (!isAiRequest && !isAuthRequest && !isMutation && !isAuditedRead) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const response = httpContext.getResponse<{ statusCode: number }>();
          void this.persistAuditLog(
            request,
            response.statusCode ?? 200,
            Date.now() - startTime,
          );
        },
        error: (error: { status?: number; statusCode?: number }) => {
          const httpStatus =
            error?.status ?? error?.statusCode ?? 500;
          void this.persistAuditLog(
            request,
            httpStatus,
            Date.now() - startTime,
          );
        },
      }),
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────────────────────

  private isExcluded(path: string): boolean {
    return EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
  }

  private deriveAction(method: string, path: string): string {
    const pathParts = path.replace(/^\/api\/v\d+\//, '').split('/');
    const resource = pathParts[0] ?? 'unknown';

    const methodActionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
      GET: 'READ',
    };

    const action = methodActionMap[method] ?? method;

    // Auth-specific action labels
    if (path.includes('/auth/login')) return 'AUTH_LOGIN';
    if (path.includes('/auth/logout')) return 'AUTH_LOGOUT';
    if (path.includes('/auth/register')) return 'AUTH_REGISTER';
    if (path.includes('/auth/password')) return 'AUTH_PASSWORD_RESET';
    if (path.includes('/auth/refresh')) return 'AUTH_TOKEN_REFRESH';
    if (path.startsWith(AI_PATH_PREFIX)) return `AI_${action}`;

    return `${action}_${resource.toUpperCase()}`;
  }

  private extractResourceId(path: string): string | undefined {
    // Matches UUID or numeric segments that appear after a resource segment
    const uuidPattern =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const numericPattern = /\/(\d+)(\/|$)/;

    const uuidMatch = path.match(uuidPattern);
    if (uuidMatch) return uuidMatch[0];

    const numericMatch = path.match(numericPattern);
    if (numericMatch) return numericMatch[1];

    return undefined;
  }

  private extractIpAddress(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() ?? request.ip ?? '';
    }
    return (
      request.headers['x-real-ip'] as string | undefined ??
      request.ip ??
      ''
    );
  }

  private async persistAuditLog(
    request: Request & {
      requestId?: string;
      tenantId?: string;
      user?: AuthenticatedUser;
    },
    httpStatus: number,
    durationMs: number,
  ): Promise<void> {
    if (!this.auditService) {
      // AuditService not yet available (e.g., early startup). Skip silently.
      return;
    }

    try {
      const method = request.method?.toUpperCase() ?? 'UNKNOWN';
      const path = request.path ?? request.url ?? '';
      const pathParts = path.replace(/^\/api\/v\d+\//, '').split('/');
      const resource = pathParts[0] ?? 'unknown';

      await this.auditService.createLog({
        userId: request.user?.id,
        tenantId: request.tenantId ?? request.user?.tenantId ?? undefined,
        action: this.deriveAction(method, path),
        resource,
        resourceId: this.extractResourceId(path),
        description: `${method} ${path} → ${httpStatus}`,
        metadata: {
          requestId: request.requestId,
          body: this.sanitizeBody(request.body as Record<string, unknown>),
          query: request.query,
        },
        ipAddress: this.extractIpAddress(request),
        userAgent: request.headers['user-agent'],
        httpMethod: method,
        httpPath: path,
        httpStatus,
        durationMs,
      });
    } catch (err) {
      // Never let audit logging failures break the primary request flow
      this.logger.error('Failed to persist audit log', err);
    }
  }

  /**
   * Removes sensitive fields from request bodies before persisting in audit logs.
   */
  private sanitizeBody(
    body: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!body || typeof body !== 'object') return {};

    const SENSITIVE_KEYS = new Set([
      'password',
      'passwordConfirm',
      'currentPassword',
      'newPassword',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'apiKey',
      'creditCard',
      'ssn',
    ]);

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(body)) {
      sanitized[key] = SENSITIVE_KEYS.has(key) ? '[REDACTED]' : value;
    }

    return sanitized;
  }
}
