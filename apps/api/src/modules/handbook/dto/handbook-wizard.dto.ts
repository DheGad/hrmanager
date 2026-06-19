import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Country {
  MY = 'MY',
  AU = 'AU',
}

export enum WorkFromHomePolicy {
  NOT_ALLOWED = 'NOT_ALLOWED',
  HYBRID = 'HYBRID',
  FULLY_REMOTE = 'FULLY_REMOTE',
  CASE_BY_CASE = 'CASE_BY_CASE',
}

export enum DressCode {
  FORMAL = 'FORMAL',
  BUSINESS_CASUAL = 'BUSINESS_CASUAL',
  CASUAL = 'CASUAL',
  SMART_CASUAL = 'SMART_CASUAL',
  INDUSTRY_SPECIFIC = 'INDUSTRY_SPECIFIC',
}

export enum PerformanceReviewFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  ANNUALLY = 'ANNUALLY',
}

export enum PublicHolidayPolicy {
  ALL_GAZETTED = 'all_gazetted',
  SELECT = 'select',
}

// ─── DTO ─────────────────────────────────────────────────────────────────────

export class HandbookWizardDto {
  @ApiProperty({ description: 'Company ID to associate the handbook with' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ description: 'Handbook display name', example: 'ACME Corp Employee Handbook 2026' })
  @IsString()
  name: string;

  @ApiProperty({ enum: Country, description: 'Jurisdiction for legal defaults' })
  @IsEnum(Country)
  country: Country;

  @ApiProperty({ minimum: 1, maximum: 60, description: 'Standard working hours per week' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  workingHoursPerWeek: number;

  @ApiProperty({ minimum: 0, description: 'Annual leave entitlement in days' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  annualLeaveDays: number;

  @ApiProperty({ minimum: 0, description: 'Sick leave entitlement in days' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sickLeaveDays: number;

  @ApiProperty({ minimum: 0, description: 'Maternity leave entitlement in weeks' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maternityLeaveWeeks: number;

  @ApiProperty({ minimum: 0, description: 'Paternity leave entitlement in days' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  paternityLeaveDays: number;

  @ApiProperty({
    enum: PublicHolidayPolicy,
    description: '"all_gazetted" to honour all gazetted public holidays, "select" for custom list',
  })
  @IsEnum(PublicHolidayPolicy)
  publicHolidayPolicy: PublicHolidayPolicy;

  @ApiPropertyOptional({
    type: [String],
    description: 'Required when publicHolidayPolicy is "select". List of selected public holiday names.',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ValidateIf((o: HandbookWizardDto) => o.publicHolidayPolicy === PublicHolidayPolicy.SELECT)
  selectedPublicHolidays?: string[];

  @ApiProperty({ minimum: 0, description: 'Notice period required from employee (days)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  noticePeriodDaysEmployee: number;

  @ApiProperty({ minimum: 0, description: 'Notice period required from employer (days)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  noticePeriodDaysEmployer: number;

  @ApiProperty({ minimum: 0, maximum: 24, description: 'Probation period in months' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(24)
  probationMonths: number;

  @ApiProperty({ enum: WorkFromHomePolicy })
  @IsEnum(WorkFromHomePolicy)
  workFromHomePolicy: WorkFromHomePolicy;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 7,
    description: 'WFH days per week — required when policy is HYBRID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(7)
  @ValidateIf((o: HandbookWizardDto) => o.workFromHomePolicy === WorkFromHomePolicy.HYBRID)
  wfhDaysPerWeek?: number;

  @ApiProperty({ enum: DressCode })
  @IsEnum(DressCode)
  dressCode: DressCode;

  @ApiProperty({
    description: 'Description of the overtime policy (rate, eligibility, cap, etc.)',
    example: 'Overtime is compensated at 1.5× the hourly base rate for up to 8 hours per week.',
  })
  @IsString()
  overtimePolicy: string;

  @ApiProperty({
    type: [String],
    description: 'Ordered list of disciplinary stages',
    example: ['verbal_warning', 'written_warning', 'final_warning', 'termination'],
  })
  @IsArray()
  @IsString({ each: true })
  disciplinaryStages: string[];

  @ApiProperty({ description: 'Whether the handbook includes a formal grievance procedure' })
  @IsBoolean()
  grievanceProcedure: boolean;

  @ApiProperty({ enum: PerformanceReviewFrequency })
  @IsEnum(PerformanceReviewFrequency)
  performanceReviewFrequency: PerformanceReviewFrequency;

  @ApiPropertyOptional({
    description: 'Free-text description of any additional policies to include',
  })
  @IsOptional()
  @IsString()
  additionalPolicies?: string;
}
