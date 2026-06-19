import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Register ───────────────────────────────────────────────────────────────

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new tenant and company admin',
    description:
      'Creates a new tenant (organisation) and its first company_admin user atomically. ' +
      'Returns a token pair immediately so the user can begin onboarding without a separate login.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant and admin user created. Token pair returned.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email address already registered.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error — invalid field value(s).' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate with email and password',
    description:
      'Validates credentials and issues an RS256 access token (default: 15 min) and a refresh token (default: 7 days). ' +
      'Optionally supply tenantId to disambiguate users with the same email across multiple tenants.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful. Token pair returned.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid email or password.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error.' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  // ── Refresh Token ──────────────────────────────────────────────────────────

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate the token pair using a refresh token',
    description:
      'Exchanges a valid refresh token for a brand-new access + refresh token pair. ' +
      'The supplied refresh token is immediately invalidated (one-time-use). ' +
      'If a previously-used token is presented, ALL sessions for the user are revoked as a theft countermeasure.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token pair rotated successfully.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Refresh token invalid, expired, or already used.' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request & { user?: AuthenticatedUser },
  ): Promise<AuthResponseDto> {
    // The refresh token is a signed JWT — decode it to extract the userId
    // without verifying expiry (we validate existence in Redis instead).
    const decoded = this.decodeRefreshToken(dto.refreshToken);
    return this.authService.refreshToken(decoded.sub, dto.refreshToken);
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke the current refresh token',
    description:
      'Deletes the supplied refresh token from Redis. The access token remains valid until its natural expiry — ' +
      'clients must discard it. Supply the same refresh token that was issued at login.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out successfully.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid access token.' })
  async logout(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: RefreshTokenDto,
  ): Promise<{ message: string }> {
    return this.authService.logout(req.user.userId, dto.refreshToken);
  }

  // ── Forgot Password ────────────────────────────────────────────────────────

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  // Aggressive rate-limit: max 5 requests per 5 minutes per IP to mitigate abuse
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @ApiOperation({
    summary: 'Request a password-reset link',
    description:
      'Sends a time-limited password-reset link to the registered email address. ' +
      'Always returns HTTP 200 regardless of whether the email is found — to prevent email enumeration.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reset link dispatched (or silently ignored for unknown emails).',
    schema: {
      properties: {
        message: { type: 'string', example: 'If an account with that email exists, a password reset link has been sent.' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, description: 'Rate limit exceeded.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  // ── Reset Password ─────────────────────────────────────────────────────────

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password using a one-time token',
    description:
      'Validates the reset token, updates the user password, and invalidates ALL active sessions. ' +
      'The token is single-use and expires after 1 hour.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully. All sessions have been terminated.',
    schema: {
      properties: {
        message: { type: 'string', example: 'Password has been reset successfully. Please log in with your new password.' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Token is invalid, expired, or passwords do not match.' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  // ── Me ─────────────────────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get the current authenticated user profile',
    description: 'Returns the full profile of the user identified by the Bearer access token. Never returns password data.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or expired access token.' })
  async getProfile(@Req() req: Request & { user: AuthenticatedUser }): Promise<UserProfileDto> {
    return this.authService.getProfile(req.user.userId);
  }

  // ── MFA ─────────────────────────────────────────────────────────────────────

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup MFA for the current user' })
  async setupMfa(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.authService.generateMfaSecret(req.user.userId, req.user.email);
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify and enable MFA' })
  async verifyMfa(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body('token') token: string,
  ) {
    return this.authService.verifyMfaSetup(req.user.userId, token);
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Decodes (without verifying) the refresh JWT to extract the `sub` claim.
   * Full validation (signature + Redis presence) happens inside AuthService.
   */
  private decodeRefreshToken(token: string): { sub: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Malformed JWT');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8')) as {
        sub?: string;
        type?: string;
      };
      if (!payload.sub) throw new Error('Missing sub claim');
      return { sub: payload.sub };
    } catch {
      throw new Error('Invalid refresh token format');
    }
  }
}
