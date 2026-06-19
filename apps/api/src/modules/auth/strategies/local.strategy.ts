import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      // Override Passport's default field name ('username') to 'email'
      usernameField: 'email',
      // Make tenantId available on req.body if passReqToCallback were true,
      // but we resolve it inside AuthService.validateUser for cleaner SRP.
      passReqToCallback: false,
    });
  }

  /**
   * Passport calls this after extracting email/password from the request body.
   * The tenantId is NOT available here because passReqToCallback is false; it is
   * resolved by AuthService using a per-request context or LoginDto lookup.
   *
   * Note: The LocalStrategy is registered but the /auth/login endpoint bypasses
   * it in favour of a direct DTO-validated flow (LoginDto → AuthService.login).
   * The strategy remains for standard @UseGuards(LocalAuthGuard) usage if needed.
   */
  async validate(email: string, password: string): Promise<unknown> {
    const user = await this.authService.validateUser(email, password, undefined);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}
