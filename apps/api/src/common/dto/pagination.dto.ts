import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// ─── Sort Order ──────────────────────────────────────────────────────────────

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// ─── PageOptionsDto ──────────────────────────────────────────────────────────

/**
 * PageOptionsDto
 *
 * Standard pagination and sorting request parameters.
 * Extend this class in feature DTOs to add domain-specific filters.
 *
 * Example:
 * ```typescript
 * export class EmployeePageOptionsDto extends PageOptionsDto {
 *   @IsOptional() @IsString() departmentId?: string;
 * }
 * ```
 */
export class PageOptionsDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit: number = 20;

  @ApiPropertyOptional({
    description: 'Field name to sort by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  readonly sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  readonly sortOrder: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Full-text search query',
    example: 'john doe',
  })
  @IsOptional()
  @IsString()
  readonly search?: string;

  /**
   * Calculated offset for use in Prisma's `skip` parameter.
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Returns a Prisma-compatible `orderBy` object.
   * Falls back to `{ createdAt: 'desc' }` when no sort field is specified.
   */
  get orderBy(): Record<string, SortOrder> {
    if (this.sortBy) {
      return { [this.sortBy]: this.sortOrder };
    }
    return { createdAt: SortOrder.DESC };
  }
}

// ─── PageMetaDto ─────────────────────────────────────────────────────────────

export interface PageMetaInput {
  pageOptionsDto: PageOptionsDto;
  total: number;
}

/**
 * PageMetaDto
 *
 * Pagination metadata attached to every paginated response.
 */
export class PageMetaDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  @Expose()
  readonly page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  @Expose()
  readonly limit: number;

  @ApiProperty({ description: 'Total number of items', example: 243 })
  @Expose()
  readonly total: number;

  @ApiProperty({ description: 'Total number of pages', example: 13 })
  @Expose()
  readonly totalPages: number;

  @ApiProperty({ description: 'Whether a previous page exists', example: false })
  @Expose()
  readonly hasPreviousPage: boolean;

  @ApiProperty({ description: 'Whether a next page exists', example: true })
  @Expose()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, total }: PageMetaInput) {
    this.page = pageOptionsDto.page;
    this.limit = pageOptionsDto.limit;
    this.total = total;
    this.totalPages = Math.ceil(total / pageOptionsDto.limit);
    this.hasPreviousPage = pageOptionsDto.page > 1;
    this.hasNextPage = pageOptionsDto.page < this.totalPages;
  }
}

// ─── PageDto ─────────────────────────────────────────────────────────────────

/**
 * PageDto<T>
 *
 * Generic paginated response container.
 * Detected by ResponseInterceptor to produce the paginated response envelope.
 *
 * Usage in service:
 * ```typescript
 * const [employees, total] = await this.prisma.$transaction([
 *   this.prisma.employee.findMany({ where, skip, take, orderBy }),
 *   this.prisma.employee.count({ where }),
 * ]);
 * return new PageDto(employees, new PageMetaDto({ pageOptionsDto, total }));
 * ```
 */
export class PageDto<T> {
  @ApiProperty({ description: 'Array of items', isArray: true })
  @IsArray()
  @Expose()
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  @Expose()
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
