import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedUser } from '../types/request.types';

/** Role that bypasses all role restrictions. */
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

/** Redis cache TTL for permission lookups (seconds). */
const PERMISSION_CACHE_TTL_SECONDS = 60;

/**
 * Minimal interface for the Redis client used in this guard.
 * Avoids coupling to a specific Redis library.
 */
export interface IRolePermissionCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl: number): Promise<void>;
}

/** DI token for the Redis/cache client. */
export const ROLE_PERMISSION_CACHE_TOKEN = 'ROLE_PERMISSION_CACHE';

/**
 * RolesGuard
 *
 * Enforces role-based access control by reading @Roles() metadata and
 * comparing it against the authenticated user's role.
 *
 * Resolution strategy:
 *  1. If no @Roles() metadata → allow all authenticated users
 *  2. If user is SUPER_ADMIN → allow unconditionally
 *  3. Check Redis cache (key: `permissions:{role}`) for cached allowed roles
 *  4. On cache miss → evaluate from the request's required roles metadata
 *     and cache the result for PERMISSION_CACHE_TTL_SECONDS
 *  5. If user's role is not in allowed roles → ForbiddenException
 *
 * Note: The "permissions" in the cache represent the set of roles that are
 * permitted for a given role's actions. This can be extended to a full RBAC/ABAC
 * system by storing and querying a permission matrix.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(ROLE_PERMISSION_CACHE_TOKEN)
    private readonly cache: IRolePermissionCache | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ── If route is public, skip ───────────────────────────────────────────────
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // ── Read required roles from metadata ─────────────────────────────────────
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator → allow any authenticated user through
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      Request & { user?: AuthenticatedUser; requestId?: string }
    >();
    const user = request.user;

    if (!user) {
      // Should not happen if JwtAuthGuard runs first; defensive check
      throw new ForbiddenException('User identity could not be determined.');
    }

    // ── SUPER_ADMIN bypasses all role checks ──────────────────────────────────
    if (user.role === SUPER_ADMIN_ROLE) {
      this.logger.verbose(
        `[${request.requestId ?? 'N/A'}] SUPER_ADMIN bypass for ${user.id}`,
      );
      return true;
    }

    // ── Check Redis cache for permitted roles ─────────────────────────────────
    const cacheKey = `permissions:${user.role}`;
    let allowedRoles: string[];

    try {
      const cached = await this.cache?.get(cacheKey);
      if (cached) {
        allowedRoles = JSON.parse(cached) as string[];
        this.logger.verbose(
          `[${request.requestId ?? 'N/A'}] Cache HIT for permissions:${user.role}`,
        );
      } else {
        // Cache miss → the "allowed roles" for this role is just the role itself.
        // In a full RBAC implementation, this would query a permissions table
        // to fetch all resource actions this role is permitted to perform.
        allowedRoles = [user.role];

        await this.cache
          ?.set(cacheKey, JSON.stringify(allowedRoles), PERMISSION_CACHE_TTL_SECONDS)
          .catch((err: Error) => {
            // Non-fatal — log and continue without cache
            this.logger.warn(`Failed to cache permissions for ${user.role}: ${err.message}`);
          });
      }
    } catch (err) {
      // If cache is unavailable, fall back to direct comparison
      this.logger.warn(
        `Permission cache unavailable; falling back to direct role check. ${(err as Error).message}`,
      );
      allowedRoles = [user.role];
    }

    // ── Check if user's role satisfies any required role ─────────────────────
    const hasRole = requiredRoles.some((required) =>
      allowedRoles.includes(required),
    );

    if (!hasRole) {
      this.logger.verbose(
        `[${request.requestId ?? 'N/A'}] Access denied for role="${user.role}" ` +
        `on route requiring roles=[${requiredRoles.join(', ')}]`,
      );
      throw new ForbiddenException(
        'You do not have the required permissions to access this resource.',
      );
    }

    return true;
  }
}
