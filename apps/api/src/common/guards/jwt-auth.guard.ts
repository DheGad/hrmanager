import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JwtAuthGuard
 *
 * Global guard that enforces JWT authentication on all routes except those
 * decorated with @Public().
 *
 * Extends Passport's AuthGuard('jwt') which delegates to JwtStrategy for
 * token extraction and verification. On success, the verified payload is
 * attached to `request.user` by the strategy.
 *
 * Public routes (marked with @Public()) skip JWT verification entirely.
 * The guard returns true immediately for these routes so downstream guards
 * (TenantGuard, RolesGuard) still run — they are responsible for their own
 * public-route handling.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // ── Check for @Public() decorator on handler or controller ────────────────
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // ── Delegate to Passport JWT strategy ─────────────────────────────────────
    return super.canActivate(context);
  }

  /**
   * Called after successful authentication.
   * Attaches the validated user to the request and logs for tracing.
   */
  handleRequest<TUser = { id: string; email: string; role: string }>(
    err: Error | null,
    user: TUser | false,
    info: { message?: string } | undefined,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const request = context.switchToHttp().getRequest<
        Request & { requestId?: string }
      >();

      this.logger.verbose(
        `[${request.requestId ?? 'N/A'}] JWT authentication failed: ${
          err?.message ?? info?.message ?? 'No token or invalid token'
        }`,
      );

      // Re-throw original error or throw UnauthorizedException
      if (err) throw err;

      // Import here to avoid circular deps at module load time
      const { UnauthorizedException } = require('@nestjs/common') as {
        UnauthorizedException: new (message: string) => Error;
      };
      throw new UnauthorizedException(
        info?.message ?? 'Authentication required. Please provide a valid token.',
      );
    }

    return user;
  }
}
