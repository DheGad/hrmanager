import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedUser } from '../types/request.types';

/** Roles that are not scoped to any specific tenant. */
const TENANT_EXEMPT_ROLES = new Set(['SUPER_ADMIN']);

/**
 * TenantGuard
 *
 * Ensures every non-public request is properly scoped to a tenant and that
 * the tenant in the JWT matches the tenant attached to the request by
 * TenantMiddleware.
 *
 * Checks performed (in order):
 *  1. Skip for @Public() routes
 *  2. Skip for SUPER_ADMIN — they operate across tenants
 *  3. Require tenantId to be set on the request (from middleware)
 *  4. Require authenticated user to have a tenantId in their JWT payload
 *  5. Cross-validate: request tenantId must equal JWT tenantId to prevent
 *     token reuse across tenants (e.g., using a tenant-A token against tenant-B API)
 *
 * This guard must run AFTER JwtAuthGuard so that `request.user` is populated.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ── Skip public routes ────────────────────────────────────────────────────
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<
      Request & {
        user?: AuthenticatedUser;
        tenantId?: string | null;
        requestId?: string;
      }
    >();

    const user = request.user;
    const requestId = request.requestId ?? 'N/A';

    // If JwtAuthGuard passed but user is absent (shouldn't happen), guard against it
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    // ── SUPER_ADMIN is tenant-exempt ──────────────────────────────────────────
    if (TENANT_EXEMPT_ROLES.has(user.role)) {
      this.logger.verbose(
        `[${requestId}] Tenant check bypassed for SUPER_ADMIN user=${user.id}`,
      );
      return true;
    }

    // ── Ensure middleware resolved a tenantId ─────────────────────────────────
    const requestTenantId = request.tenantId;
    if (!requestTenantId) {
      this.logger.warn(
        `[${requestId}] No tenantId on request for user=${user.id}. ` +
        'Middleware may not have run, or JWT lacked tenantId.',
      );
      throw new ForbiddenException(
        'Tenant context could not be resolved. Ensure your request includes a valid token.',
      );
    }

    // ── Ensure the JWT payload carries a tenantId ─────────────────────────────
    if (!user.tenantId) {
      this.logger.warn(
        `[${requestId}] JWT for user=${user.id} has no tenantId claim.`,
      );
      throw new ForbiddenException(
        'Your authentication token does not contain tenant information.',
      );
    }

    // ── Cross-validate request tenantId vs JWT tenantId ───────────────────────
    // Prevents a user from using a valid token for tenant-A to access tenant-B.
    if (user.tenantId !== requestTenantId) {
      this.logger.warn(
        `[${requestId}] Tenant mismatch! ` +
        `JWT tenantId="${user.tenantId}" vs request tenantId="${requestTenantId}" ` +
        `for user=${user.id}. Possible token reuse attack.`,
      );
      throw new ForbiddenException(
        'You are not authorized to access resources belonging to this tenant.',
      );
    }

    return true;
  }
}
