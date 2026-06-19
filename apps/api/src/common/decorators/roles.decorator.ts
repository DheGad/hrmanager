import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by RolesGuard to read required roles from route metadata.
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles(...roles) decorator
 *
 * Restricts access to a route to users who have one of the specified roles.
 * Must be used alongside @UseGuards(RolesGuard), or with the global RolesGuard.
 *
 * Usage:
 * ```typescript
 * @Get('admin-only')
 * @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
 * getAdminData() { ... }
 * ```
 *
 * Note: SUPER_ADMIN bypasses all role checks in RolesGuard regardless of
 * what roles are specified here.
 */
export const Roles = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
