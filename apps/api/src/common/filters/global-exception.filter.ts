import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Maps Prisma error codes to HTTP status codes and user-friendly messages.
 */
const PRISMA_ERROR_MAP: Record<
  string,
  { status: HttpStatus; message: string; error: string }
> = {
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    message: 'The provided value for a field is too long.',
    error: 'Bad Request',
  },
  P2001: {
    status: HttpStatus.NOT_FOUND,
    message: 'The record does not exist.',
    error: 'Not Found',
  },
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'A record with that value already exists.',
    error: 'Conflict',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'A referenced record could not be found.',
    error: 'Bad Request',
  },
  P2004: {
    status: HttpStatus.BAD_REQUEST,
    message: 'A database constraint was violated.',
    error: 'Bad Request',
  },
  P2005: {
    status: HttpStatus.BAD_REQUEST,
    message: 'The value stored in the database is invalid for the field type.',
    error: 'Bad Request',
  },
  P2006: {
    status: HttpStatus.BAD_REQUEST,
    message: 'The provided value for a field is not valid.',
    error: 'Bad Request',
  },
  P2011: {
    status: HttpStatus.BAD_REQUEST,
    message: 'A required field is null.',
    error: 'Bad Request',
  },
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    message: 'A required relation violation occurred.',
    error: 'Bad Request',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: 'Record not found.',
    error: 'Not Found',
  },
  P2034: {
    status: HttpStatus.CONFLICT,
    message: 'Transaction failed due to a write conflict. Please retry.',
    error: 'Conflict',
  },
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction =
      configService.get<string>('app.nodeEnv') === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const path = request.url ?? 'unknown';
    const requestId = request.requestId ?? 'N/A';
    const timestamp = new Date().toISOString();

    let statusCode: number;
    let message: string | string[];
    let error: string;

    // ── HttpException (NestJS built-ins + manual throws) ─────────────────────
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.message;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp['message'] as string | string[]) ?? exception.message;
        error = (resp['error'] as string) ?? HttpStatus[statusCode] ?? 'Error';
      } else {
        message = exception.message;
        error = HttpStatus[statusCode] ?? 'Error';
      }

      // Log 5xx as errors, 4xx as warnings
      if (statusCode >= 500) {
        this.logger.error(
          `[${requestId}] HTTP ${statusCode} ${path}: ${JSON.stringify(message)}`,
          this.isProduction ? undefined : exception.stack,
        );
      } else {
        this.logger.warn(
          `[${requestId}] HTTP ${statusCode} ${path}: ${JSON.stringify(message)}`,
        );
      }
    }

    // ── PrismaClientKnownRequestError ─────────────────────────────────────────
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_MAP[exception.code];

      if (mapped) {
        statusCode = mapped.status;
        error = mapped.error;
        // In production never expose which field caused the error
        message = this.isProduction
          ? mapped.message
          : `${mapped.message} [${exception.code}]${
              exception.meta ? `: ${JSON.stringify(exception.meta)}` : ''
            }`;
      } else {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        error = 'Database Error';
        message = this.isProduction
          ? 'A database error occurred.'
          : `Prisma error ${exception.code}: ${exception.message}`;
      }

      this.logger.error(
        `[${requestId}] Prisma ${exception.code} on ${path}: ${exception.message}`,
        {
          code: exception.code,
          meta: exception.meta,
          stack: this.isProduction ? undefined : exception.stack,
        },
      );
    }

    // ── PrismaClientValidationError ───────────────────────────────────────────
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Bad Request';
      message = this.isProduction
        ? 'Invalid data provided.'
        : 'Prisma validation error: ' + exception.message.split('\n').pop()?.trim();

      this.logger.warn(`[${requestId}] Prisma validation error on ${path}`);
    }

    // ── PrismaClientInitializationError ───────────────────────────────────────
    else if (exception instanceof Prisma.PrismaClientInitializationError) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      error = 'Service Unavailable';
      message = 'The database service is currently unavailable. Please try again later.';

      this.logger.error(
        `[${requestId}] Prisma initialization error: ${exception.message}`,
        this.isProduction ? undefined : exception.stack,
      );
    }

    // ── Generic JavaScript Error ───────────────────────────────────────────────
    else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
      message = this.isProduction
        ? 'An unexpected error occurred. Our team has been notified.'
        : exception.message;

      this.logger.error(
        `[${requestId}] Unhandled error on ${path}: ${exception.message}`,
        this.isProduction ? undefined : exception.stack,
      );
    }

    // ── Unknown throw ─────────────────────────────────────────────────────────
    else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
      message = 'An unexpected error occurred.';

      this.logger.error(
        `[${requestId}] Unknown exception type thrown on ${path}:`,
        exception,
      );
    }

    const body: ErrorResponse = {
      success: false,
      statusCode,
      message,
      error,
      timestamp,
      path,
      requestId,
    };

    response.status(statusCode).json(body);
  }
}
