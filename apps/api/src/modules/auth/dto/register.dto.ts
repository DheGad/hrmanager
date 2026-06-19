import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Supported countries for tenant onboarding.
 * Drives payroll, compliance, and tax-rule selection.
 */
export enum Country {
  MY = 'MY', // Malaysia
  AU = 'AU', // Australia
  SG = 'SG', // Singapore
}

export class RegisterDto {
  @ApiProperty({
    description: 'Company / organisation name — becomes the tenant display name',
    example: 'Acme Corp Sdn Bhd',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }: { value: string }) => value?.trim())
  tenantName: string;

  @ApiProperty({
    description: 'Country of registration (ISO-3166-1 alpha-2). Determines payroll & compliance rules.',
    enum: Country,
    example: Country.MY,
  })
  @IsEnum(Country)
  tenantCountry: Country;

  @ApiProperty({ description: "Admin user's first name", example: 'Jane', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())
  firstName: string;

  @ApiProperty({ description: "Admin user's last name", example: 'Doe', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())
  lastName: string;

  @ApiProperty({ description: 'Work email address — must be unique within the tenant', example: 'jane.doe@acmecorp.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(254) // RFC 5321 max
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description:
      'Password — minimum 8 characters, must contain at least one uppercase letter, ' +
      'one lowercase letter, one digit, and one special character (!@#$%^&*)',
    minLength: 8,
    maxLength: 128,
    example: 'Secure@123',
  })
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @MaxLength(128, { message: 'password must not exceed 128 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*)',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Contact phone number in E.164 format',
    example: '+60123456789',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'phone must be a valid E.164 phone number' })
  phone?: string;
}
