import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfig } from '../../../config/configuration';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Shape of the payload embedded in every access token.
 * Kept minimal to reduce token size — full profile is fetched on demand.
 */
export interface JwtPayload {
  sub: string;       // user.id
  email: string;
  role: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}

/**
 * The object attached to `request.user` after successful JWT validation.
 * Consumer code can type-cast `req.user as AuthenticatedUser`.
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly prisma: PrismaService,
  ) {
    super({
      // Extract from Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject expired tokens at the strategy level — no fallthrough
      ignoreExpiration: false,
      // HS256: verify with the secret key
      secretOrKey: config.get<AppConfig['jwt']>('jwt')!.secret,
      algorithms: ['HS256'],
    });
  }

  /**
   * Called by Passport after signature + expiry checks pass.
   * We perform a live DB lookup so revoked / deactivated users are rejected
   * immediately — even if their token hasn't expired yet.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const { sub: userId, tenantId } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        tenantId: true,
        role: true,
        email: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // Guard against cross-tenant token replay
    if (user.tenantId !== tenantId) {
      throw new UnauthorizedException('Token tenant mismatch');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
