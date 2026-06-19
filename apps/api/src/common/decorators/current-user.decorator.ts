import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../types/request.types';

/**
 * @CurrentUser() parameter decorator
 *
 * Extracts the authenticated user from the request object.
 * The user is populated by the JwtStrategy after successful JWT verification.
 *
 * Usage:
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   return this.usersService.findOne(user.id);
 * }
 * ```
 *
 * If a specific property key is provided, returns that property instead:
 * ```typescript
 * @Get('my-data')
 * getData(@CurrentUser('id') userId: string) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (
    property: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] | undefined => {
    const request = ctx.switchToHttp().getRequest<
      Request & { user?: AuthenticatedUser }
    >();

    const user = request.user;

    if (!user) return undefined;
    if (property) return user[property];
    return user;
  },
);
