import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * @CurrentTenant() parameter decorator
 *
 * Extracts the current tenantId from the request object.
 * The tenantId is attached by TenantMiddleware before guards run, and
 * confirmed/authorized by TenantGuard.
 *
 * Returns `null` for super_admin requests that are not scoped to a tenant.
 *
 * Usage:
 * ```typescript
 * @Get('employees')
 * listEmployees(@CurrentTenant() tenantId: string) {
 *   return this.employeeService.findAll(tenantId);
 * }
 * ```
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { tenantId?: string | null }>();

    return request.tenantId ?? null;
  },
);
