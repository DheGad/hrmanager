import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'User email address', example: 'jane.doe@acmecorp.com' })
  email: string;

  @ApiProperty({ description: 'First name', example: 'Jane' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Full display name', example: 'Jane Doe' })
  fullName: string;

  @ApiProperty({ description: 'RBAC role assigned to the user', example: 'company_admin' })
  role: string;

  @ApiProperty({ description: 'Tenant UUID this user belongs to', example: '550e8400-e29b-41d4-a716-446655440001' })
  tenantId: string;

  @ApiProperty({ description: 'Tenant display name', example: 'Acme Corp Sdn Bhd' })
  tenantName: string;

  @ApiProperty({ description: 'Whether the user account is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Timestamp of last successful login', example: '2026-06-16T10:00:00.000Z', nullable: true })
  lastLoginAt: Date | null;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Short-lived RS256 JWT access token (default TTL: 15 minutes)',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Long-lived opaque refresh token for rotating access tokens (default TTL: 7 days)',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token TTL in seconds',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Authenticated user profile (never contains the password hash)',
    type: UserProfileDto,
  })
  user: UserProfileDto;
}
