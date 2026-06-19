import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by JwtAuthGuard to identify public routes.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() decorator
 *
 * Marks a route or controller as publicly accessible — i.e., it does NOT
 * require a valid JWT. The global JwtAuthGuard checks for this metadata
 * and skips authentication when present.
 *
 * Usage:
 * ```typescript
 * @Public()
 * @Post('auth/login')
 * login(@Body() dto: LoginDto) { ... }
 *
 * // Entire controller as public:
 * @Public()
 * @Controller('health')
 * export class HealthController { ... }
 * ```
 *
 * WARNING: Never apply @Public() to routes that access sensitive data.
 * Business-level authorization (roles, tenant scope) is still enforced
 * by other guards even on public routes.
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
