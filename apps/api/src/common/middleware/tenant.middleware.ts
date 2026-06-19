import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Shape of the decoded JWT payload — only the fields we care about here.
 * We decode WITHOUT signature verification because full verification happens
 * in the JwtStrategy. This is intentional: we only need the tenantId claim
 * to attach context, not to trust it for authorization.
 */
interface JwtPayloadClaims {
  sub?: string;
  tenantId?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * TenantMiddleware
 *
 * Extracts the tenant context for every API request before it reaches any
 * controller or guard. This allows guards and services to safely read
 * `req.tenantId` without re-parsing the token.
 *
 * Resolution order (first non-empty value wins):
 *  1. JWT payload `tenantId` claim   — decoded without verification
 *  2. `X-Tenant-ID` request header  — for super_admin cross-tenant operations
 *
 * If neither source provides a tenantId, `req.tenantId` is set to `null`.
 * The TenantGuard downstream will reject requests that require a tenant.
 *
 * Security note: Decoding the JWT here (without verifying the signature) is
 * safe because:
 *  - The extracted tenantId is only used for informational routing / logging.
 *  - All authorization decisions (can this user act in this tenant?) are made
 *    in TenantGuard after the JwtAuthGuard has fully verified the signature.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  use(
    req: Request & { tenantId?: string | null; requestId?: string },
    _res: Response,
    next: NextFunction,
  ): void {
    // ── Attach a request ID for tracing ──────────────────────────────────────
    if (!req.requestId) {
      req.requestId = this.generateRequestId();
    }

    // ── Extract tenantId ─────────────────────────────────────────────────────
    let tenantId: string | null = null;

    // 1. Try JWT payload (preferred — most trustworthy source of tenant claim)
    const tokenPayload = this.extractJwtPayloadUnsafe(req);
    if (tokenPayload?.tenantId) {
      tenantId = tokenPayload.tenantId;
    }

    // 2. Fallback: X-Tenant-ID header (e.g., super_admin acting on behalf of a tenant)
    if (!tenantId) {
      const headerTenantId = req.headers['x-tenant-id'];
      if (typeof headerTenantId === 'string' && headerTenantId.trim()) {
        tenantId = headerTenantId.trim();
        this.logger.verbose(
          `[${req.requestId}] Using X-Tenant-ID header: ${tenantId}`,
        );
      }
    }

    req.tenantId = tenantId ?? null;

    if (!tenantId) {
      this.logger.verbose(
        `[${req.requestId}] No tenantId resolved for ${req.method} ${req.path}. ` +
        'Downstream guards will reject if tenancy is required.',
      );
    }

    next();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Extracts and base64-decodes the JWT payload WITHOUT verifying the
   * signature. This is intentionally unsafe for the purpose of reading
   * metadata (tenantId, sub) before the auth guard runs.
   */
  private extractJwtPayloadUnsafe(
    req: Request,
  ): JwtPayloadClaims | null {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader || typeof authHeader !== 'string') return null;

      const [scheme, token] = authHeader.split(' ');
      if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Base64url → Base64 → JSON
      const payloadBase64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      // Pad to a valid base64 length
      const padded = payloadBase64.padEnd(
        payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
        '=',
      );

      const decoded = Buffer.from(padded, 'base64').toString('utf-8');
      return JSON.parse(decoded) as JwtPayloadClaims;
    } catch {
      // Malformed JWT — not an error here; auth guard will handle it
      return null;
    }
  }

  /**
   * Generates a short random request ID for tracing.
   * Uses crypto.randomUUID() when available (Node ≥ 14.17), otherwise falls
   * back to a hex string.
   */
  private generateRequestId(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return (
        Math.random().toString(36).substring(2, 10) +
        Date.now().toString(36)
      );
    }
  }
}
