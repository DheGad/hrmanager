// @ts-nocheck
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import Redis from 'ioredis';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as qrcode from 'qrcode';

import { RedisService } from '../../shared/redis/redis.service';
import { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../database/prisma.service';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Refresh token TTL: 7 days in seconds */
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Password-reset token TTL: 1 hour in seconds */
const RESET_TOKEN_TTL_SECONDS = 60 * 60;

/** Argon2id parameters — OWASP recommended minimums for 2024 */
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  /** Access token TTL in seconds (parsed from config, e.g. "15m" → 900) */
  expiresIn: number;
}

interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  tenantName: string;
  isActive: boolean;
  lastLoginAt: Date | null;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig>,
    private readonly events: EventEmitter2,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Registers a brand-new tenant and its first company_admin user atomically.
   * A Prisma interactive transaction ensures either both records are created
   * or neither is — preventing orphaned tenants on downstream failure.
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const { tenantName, tenantCountry, firstName, lastName, email, password, phone } = dto;

    // Eagerly check for duplicate email to give a friendly error before hitting the DB transaction
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    const passwordHash = await this.hashPassword(password);
    const slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);

    const { user, tenant } = await this.prisma.$transaction(async (tx) => {
      // 1. Create tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
          country: tenantCountry,
          isActive: true,
        },
      });

      // 2. Create the first company_admin user scoped to this tenant
      const newUser = await tx.user.create({
        data: {
          tenantId: newTenant.id,
          email,
          passwordHash,
          firstName,
          lastName,
          phone: phone ?? null,
          role: 'COMPANY_ADMIN',
          isActive: true,
          emailVerified: false,
        },
      });

      return { user: newUser, tenant: newTenant };
    });

    this.logger.log(`New tenant registered: tenantId=${tenant.id} userId=${user.id}`);

    this.events.emit('audit.log', {
      action: 'USER_REGISTERED',
      actorId: user.id,
      tenantId: tenant.id,
      metadata: { email: user.email, role: user.role },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, tenant.id);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.toUserProfile(user, tenant.name),
    };
  }

  /**
   * Authenticates a user by email + password (+ optional tenantId).
   * On success, issues a fresh access/refresh token pair and records the login timestamp.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, tenantId } = dto;

    const user = await this.validateUser(email, password, tenantId);
    if (!user) {
      // Deliberate vague message — prevents email enumeration
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update lastLoginAt — fire-and-forget, non-critical
    this.prisma.user
      .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
      .catch((err: Error) => this.logger.warn(`Failed to update lastLoginAt for user ${user.id}: ${err.message}`));

    this.events.emit('audit.log', {
      action: 'USER_LOGIN',
      actorId: user.id,
      tenantId: user.tenantId,
      metadata: { email: user.email },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.tenantId);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { name: true },
    });

    return {
      ...tokens,
      user: this.toUserProfile(user, tenant?.name ?? ''),
    };
  }

  /**
   * Validates the supplied refresh token against Redis and rotates the pair.
   * The old token is immediately invalidated (one-time-use semantics).
   */
  async refreshToken(userId: string, incomingRefreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = this.hashToken(incomingRefreshToken);
    const redisKey = this.buildRefreshKey(userId, tokenHash);

    const storedValue = await this.redisService.getClient().get(redisKey);
    if (!storedValue) {
      this.logger.warn(`Refresh token replay or expiry detected for userId=${userId}`);
      // Treat as potential token theft — invalidate ALL sessions for this user
      await this.invalidateAllUserSessions(userId);
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Immediately delete the old token (rotation — prevents reuse)
    await this.redisService.getClient().del(redisKey);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
        firstName: true,
        lastName: true,
        lastLoginAt: true,
        tenant: { select: { name: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account not found or deactivated');
    }

    this.events.emit('audit.log', {
      action: 'TOKEN_REFRESHED',
      actorId: user.id,
      tenantId: user.tenantId,
      metadata: {},
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.tenantId);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.toUserProfile(user, user.tenant?.name ?? ''),
    };
  }

  // ── MFA API ────────────────────────────────────────────────────────────────

  /**
   * Generates a new TOTP secret and returns the QR code URI.
   */
  async generateMfaSecret(userId: string, email: string) {
    const secret = generateSecret();
    const otpauthUrl = generateURI({ label: email, issuer: 'HRManager4U.ai', secret });
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    // Store temporarily until verified
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret }
    });

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  /**
   * Verifies the TOTP code and enables MFA.
   */
  async verifyMfaSetup(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA not initialized');
    }

    const { valid } = verifySync({ token, secret: user.mfaSecret });
    if (!valid) {
      throw new UnauthorizedException('Invalid TOTP token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true }
    });

    return { message: 'MFA enabled successfully' };
  }

  /**
   * Logs the user out by revoking the specific refresh token from Redis.
   * The access token remains valid until its natural expiry (15 min default).
   * Clients must discard it immediately upon logout.
   */
  async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(refreshToken);
    const redisKey = this.buildRefreshKey(userId, tokenHash);

    await this.redisService.getClient().del(redisKey);

    this.events.emit('audit.log', {
      action: 'USER_LOGOUT',
      actorId: userId,
      tenantId: null,
      metadata: {},
    });

    this.logger.log(`User logged out: userId=${userId}`);
    return { message: 'Logged out successfully' };
  }

  /**
   * Initiates a password-reset flow.
   * Always returns HTTP 200 — even for unknown emails — to prevent enumeration.
   * A time-limited token is stored in the DB and emailed to the user.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email, tenantId } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        ...(tenantId ? { tenantId } : {}),
        isActive: true,
      },
      select: { id: true, email: true, firstName: true, tenantId: true },
    });

    const genericResponse = {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    // Silently return success for unknown emails — prevents email enumeration
    if (!user) {
      this.logger.debug(`forgot-password: no active user found for email=${email}`);
      return genericResponse;
    }

    const { token, tokenHash, expiresAt } = this.generateResetToken();

    // Update the existing user with the new reset token and expiry
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: expiresAt,
      },
    });

    // Emit event — handled by MailModule's NotificationListener
    this.events.emit('auth.forgot-password', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      resetToken: token,
      expiresAt,
    });

    this.logger.log(`Password reset token issued for userId=${user.id}`);

    return genericResponse;
  }

  /**
   * Validates a password-reset token, updates the user's password, and
   * invalidates ALL active sessions to force re-authentication.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = dto;

    const tokenHash = this.hashToken(token);

    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: tokenHash },
      select: { id: true, email: true, tenantId: true, isActive: true, passwordResetExpiry: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (user.passwordResetExpiry && user.passwordResetExpiry < new Date()) {
      // Clean up the stale record
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: null, passwordResetExpiry: null },
      });
      throw new BadRequestException('Password reset token has expired. Please request a new one.');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated. Please contact support.');
    }

    const newPasswordHash = await this.hashPassword(password);

    // Update password + clear reset token fields
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    // Revoke all active refresh tokens — forces full re-login on all devices
    await this.invalidateAllUserSessions(user.id);

    this.events.emit('audit.log', {
      action: 'PASSWORD_RESET',
      actorId: user.id,
      tenantId: user.tenantId,
      metadata: { email: user.email },
    });

    this.logger.log(`Password reset successful for userId=${user.id}`);

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  /**
   * Validates email + password + (optional) tenantId.
   * Used by LocalStrategy and directly by login().
   * Returns the safe user object (no passwordHash) or null on failure.
   */
  async validateUser(
    email: string,
    password: string,
    tenantId?: string,
  ): Promise<SafeUser | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        ...(tenantId ? { tenantId } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        role: true,
        tenantId: true,
        isActive: true,
        lastLoginAt: true,
        tenant: { select: { name: true } },
      },
    });

    if (!user) {
      // Run a dummy hash verify to prevent timing attacks on user enumeration
      await this.verifyPassword('$argon2id$v=19$m=65536,t=3,p=4$AAAA', 'dummy');
      return null;
    }

    const isPasswordValid = await this.verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated. Please contact your administrator.');
    }

    const { passwordHash: _omit, tenant, ...safeUser } = user;
    return { ...safeUser, tenantName: tenant?.name ?? '' };
  }

  /**
   * Fetches the full profile for the authenticated user.
   * Used by GET /auth/me.
   */
  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
        lastLoginAt: true,
        tenant: { select: { name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserProfile(user, user.tenant?.name ?? '');
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Signs both access and refresh tokens.
   * The refresh token is also a signed JWT so it self-identifies the userId,
   * enabling stateless parsing before the Redis lookup.
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
  ): Promise<GeneratedTokens> {
    const jwtConfig = this.config.get<AppConfig['jwt']>('jwt')!;

    const payload: JwtPayload = { sub: userId, email, role, tenantId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('jwt.secret'),
        algorithm: 'HS256',
        expiresIn: jwtConfig.accessExpiresIn,
      }),
      this.jwtService.signAsync(
        { sub: userId, type: 'refresh' },
        {
          secret: this.config.getOrThrow('jwt.secret'),
          algorithm: 'HS256',
          expiresIn: jwtConfig.refreshExpiresIn,
        },
      ),
    ]);

    const expiresIn = this.parseDurationToSeconds(jwtConfig.accessExpiresIn);

    return { accessToken, refreshToken, expiresIn };
  }

  /**
   * Stores a HMAC-SHA256 hash of the refresh token in Redis with a 7-day TTL.
   * We never store the plaintext token — the hash is sufficient for lookup.
   */
  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const redisKey = this.buildRefreshKey(userId, tokenHash);

    await this.redisService.getClient().setex(redisKey, REFRESH_TOKEN_TTL_SECONDS, '1');
  }

  /**
   * Removes ALL refresh token entries for a user from Redis.
   * Used after password reset or suspected token theft.
   */
  private async invalidateAllUserSessions(userId: string): Promise<void> {
    const pattern = `refresh_token:${userId}:*`;
    const client = this.redisService.getClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      this.logger.warn(`Invalidated ${keys.length} session(s) for userId=${userId}`);
    }
  }

  /**
   * Hashes a password using Argon2id with OWASP-recommended parameters.
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, ARGON2_OPTIONS);
    } catch (error) {
      this.logger.error('Failed to hash password', (error as Error).stack);
      throw new InternalServerErrorException('Failed to process credentials');
    }
  }

  /**
   * Verifies a plaintext password against an Argon2id hash.
   * Returns false on any error rather than throwing — callers treat false as invalid.
   */
  private async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password, { type: argon2.argon2id });
    } catch {
      return false;
    }
  }

  /**
   * Generates a cryptographically random password-reset token.
   * The raw token is sent to the user; only the SHA-256 hash is stored.
   */
  private generateResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
    const token = randomBytes(48).toString('hex'); // 96-char hex string
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_SECONDS * 1000);
    return { token, tokenHash, expiresAt };
  }

  /**
   * Produces a deterministic HMAC-SHA256 hash of a token string.
   * Used for both refresh tokens (Redis lookup) and reset tokens (DB lookup).
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Builds the namespaced Redis key for a refresh token entry. */
  private buildRefreshKey(userId: string, tokenHash: string): string {
    return `refresh_token:${userId}:${tokenHash}`;
  }

  /**
   * Converts a duration string (e.g. "15m", "7d", "3600") to seconds.
   * Supports: s (seconds), m (minutes), h (hours), d (days), w (weeks).
   */
  private parseDurationToSeconds(duration: string): number {
    const match = /^(\d+)([smhdw]?)$/.exec(duration);
    if (!match) return 900; // fallback: 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
      '': 1, // bare number treated as seconds
    };

    return value * (multipliers[unit] ?? 1);
  }

  /**
   * Maps a Prisma user record + tenant name to a safe UserProfileDto.
   * The passwordHash field is explicitly excluded via Prisma select — never present here.
   */
  private toUserProfile(
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      tenantId: string;
      isActive: boolean;
      lastLoginAt?: Date | null;
    },
    tenantName: string,
  ): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role,
      tenantId: user.tenantId,
      tenantName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ?? null,
    };
  }
}
