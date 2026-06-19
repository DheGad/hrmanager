// @ts-nocheck
// =============================================================================
// TenantService
// Handles tenant lookup, caching, settings update, stats aggregation,
// and tenant-access security validation.
// =============================================================================

import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';

/** Cache TTL for tenant lookups — 5 minutes */
const TENANT_CACHE_TTL_SECONDS = 300;

export interface TenantStats {
  employeeCount: number;
  activeEmployeeCount: number;
  documentCount: number;
  companyCount: number;
  complianceScore: number | null;
}

export interface UpdateTenantSettingsDto {
  name?: string;
  settings?: Record<string, unknown>;
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ─── findById ─────────────────────────────────────────────────────────────

  /**
   * Find a tenant by primary key.
   * Results are cached in Redis for TENANT_CACHE_TTL_SECONDS.
   *
   * Returns 404 regardless of whether the tenant doesn't exist or is inactive —
   * this prevents tenant enumeration by external actors.
   */
  async findById(id: string) {
    const cacheKey = `tenant:id:${id}`;

    // ── Cache check ──────────────────────────────────────────────────────────
    const cached = await this.redis.getJson<ReturnType<typeof this.mapTenant>>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for tenant id=${id}`);
      return cached;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            companies: true,
            users: true,
          },
        },
      },
    });

    if (!tenant || !tenant.isActive) {
      throw new NotFoundException('Tenant not found');
    }

    const mapped = this.mapTenant(tenant);
    await this.redis.setJson(cacheKey, mapped, TENANT_CACHE_TTL_SECONDS);

    return mapped;
  }

  // ─── findBySlug ───────────────────────────────────────────────────────────

  /**
   * Find a tenant by slug — used for white-label subdomain resolution.
   * e.g., acme.hrmanager4u.ai → slug=acme
   *
   * Cached in Redis to avoid DB hits on every incoming request.
   */
  async findBySlug(slug: string) {
    const cacheKey = `tenant:slug:${slug}`;

    const cached = await this.redis.getJson<ReturnType<typeof this.mapTenant>>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for tenant slug=${slug}`);
      return cached;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            companies: true,
            users: true,
          },
        },
      },
    });

    if (!tenant || !tenant.isActive) {
      throw new NotFoundException('Tenant not found');
    }

    const mapped = this.mapTenant(tenant);
    await this.redis.setJson(cacheKey, mapped, TENANT_CACHE_TTL_SECONDS);

    return mapped;
  }

  // ─── update ───────────────────────────────────────────────────────────────

  /**
   * Update tenant name or settings (COMPANY_ADMIN / SUPER_ADMIN only).
   * Invalidates the tenant cache after a successful update.
   */
  async update(id: string, dto: UpdateTenantSettingsDto) {
    // Verify tenant exists first to return 404 cleanly
    await this.findById(id);

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.settings !== undefined ? { settings: dto.settings } : {}),
      },
      include: {
        _count: {
          select: { companies: true, users: true },
        },
      },
    });

    // ── Invalidate cache ─────────────────────────────────────────────────────
    await Promise.all([
      this.redis.del(`tenant:id:${id}`),
      this.redis.del(`tenant:slug:${updated.slug}`),
    ]);

    this.logger.log(`Tenant updated: id=${id}`);
    return this.mapTenant(updated);
  }

  // ─── getStats ─────────────────────────────────────────────────────────────

  /**
   * Aggregate business statistics for a tenant dashboard.
   * Returns employee counts, document count, company count,
   * and the most recent compliance score (or null if none exists).
   *
   * Cached for 60 seconds — stats are near-realtime, not realtime.
   */
  async getStats(tenantId: string): Promise<TenantStats> {
    const cacheKey = `tenant:stats:${tenantId}`;
    const cached = await this.redis.getJson<TenantStats>(cacheKey);
    if (cached) {
      return cached;
    }

    // Run all DB aggregations in parallel
    const [employeeCount, activeEmployeeCount, documentCount, companyCount, latestCompliance] =
      await Promise.all([
        this.prisma.employee.count({
          where: { tenantId },
        }),
        this.prisma.employee.count({
          where: { tenantId, employmentStatus: 'ACTIVE' },
        }),
        this.prisma.document.count({
          where: { tenantId },
        }),
        this.prisma.company.count({
          where: { tenantId, isActive: true },
        }),
        this.prisma.complianceRecord.findFirst({
          where: { tenantId },
          orderBy: { assessedAt: 'desc' },
          select: { score: true },
        }),
      ]);

    const stats: TenantStats = {
      employeeCount,
      activeEmployeeCount,
      documentCount,
      companyCount,
      complianceScore: latestCompliance?.score ?? null,
    };

    await this.redis.setJson(cacheKey, stats, 60);
    return stats;
  }

  // ─── validateTenantAccess ─────────────────────────────────────────────────

  /**
   * Security check: verify that a given user belongs to this tenant.
   * Throws ForbiddenException if the user is not a member of the tenant.
   *
   * Used by services to perform secondary tenant isolation checks when
   * the TenantGuard alone is not sufficient (e.g., cross-resource access).
   */
  async validateTenantAccess(tenantId: string, userId: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: { id: true, tenantId: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new ForbiddenException(
        'You do not have access to this tenant resource.',
      );
    }

    if (user.tenantId !== tenantId) {
      this.logger.warn(
        `validateTenantAccess: user=${userId} tenantId mismatch (expected=${tenantId}, actual=${user.tenantId})`,
      );
      throw new ForbiddenException(
        'Cross-tenant access is not permitted.',
      );
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private mapTenant(
    tenant: {
      id: string;
      name: string;
      slug: string;
      plan: string;
      country: string;
      isActive: boolean;
      settings: unknown;
      createdAt: Date;
      updatedAt: Date;
      _count: { companies: number; users: number };
    },
  ) {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      country: tenant.country,
      isActive: tenant.isActive,
      settings: tenant.settings,
      companyCount: tenant._count.companies,
      userCount: tenant._count.users,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}
