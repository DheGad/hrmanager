import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Models that are scoped to a tenant.
 * Queries on these models MUST include a tenantId filter.
 */
const TENANT_SCOPED_MODELS = new Set([
  'employee',
  'company',
  'document',
  'knowledgebase',
  'knowledgebasechunk',
  'aiconversation',
  'aimessage',
  'handbook',
  'handbooksection',
  'compliance',
  'complianceitem',
  'auditlog',
  'onboarding',
  'offboarding',
  'leaveRequest',
  'benefit',
  'payroll',
]);

/**
 * Models that support soft-deletes via a `deletedAt` timestamp field.
 * Finds on these models will automatically exclude soft-deleted records.
 */
const SOFT_DELETE_MODELS = new Set<string>([]);

/** Threshold in milliseconds above which a query is logged as slow. */
const SLOW_QUERY_THRESHOLD_MS = 1000;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
    const isDev = nodeEnv === 'development';

    super({
      datasources: {
        db: {
          url: configService.get<string>('database.url'),
        },
      },
      log: isDev
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
          ]
        : [
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
          ],
      errorFormat: isDev ? 'pretty' : 'minimal',
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to the database...');

    // ── Log slow queries ──────────────────────────────────────────────────────
    // Prisma emits 'query' events only when log level includes 'query'.
    (this as unknown as PrismaClient & { $on: (event: string, cb: (...args: unknown[]) => void) => void }).$on(
      'query',
      (event: Prisma.QueryEvent) => {
        if (event.duration >= SLOW_QUERY_THRESHOLD_MS) {
          this.logger.warn(
            `Slow query detected (${event.duration}ms): ${event.query}`,
            { params: event.params, target: event.target },
          );
        }
      },
    );

    // ── Register middleware ───────────────────────────────────────────────────
    this.registerTenantIsolationMiddleware();
    this.registerSoftDeleteMiddleware();

    await this.$connect();
    this.logger.log('Database connection established.');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from the database...');
    await this.$disconnect();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Middleware: Tenant Isolation
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Warns (in development) or logs (in production) when a query on a
   * tenant-scoped model is missing a tenantId filter.
   *
   * This is a development-safety net. Actual enforcement happens in
   * application-layer services and the TenantGuard.
   */
  private registerTenantIsolationMiddleware(): void {
    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      const modelName = params.model?.toLowerCase();

      if (modelName && TENANT_SCOPED_MODELS.has(modelName)) {
        const operation = params.action;
        const isMutation = ['create', 'createMany', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(operation);
        const isQuery = ['findFirst', 'findMany', 'findUnique', 'findUniqueOrThrow', 'findFirstOrThrow', 'count', 'aggregate', 'groupBy'].includes(operation);

        if (isQuery || isMutation) {
          const args = params.args ?? {};
          const where = args.where ?? {};
          const data = args.data ?? {};

          const hasTenantFilter = 'tenantId' in where;
          const hasTenantData = 'tenantId' in data;

          if (!hasTenantFilter && !hasTenantData && !isMutation) {
            this.logger.warn(
              `[TenantIsolation] Missing tenantId in WHERE clause for model="${params.model}", action="${params.action}". ` +
              'Ensure tenant scoping is applied at the service layer.',
            );
          }
        }
      }

      return next(params);
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Middleware: Soft Delete
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Automatically injects `deletedAt: null` into WHERE clauses for
   * soft-deletable models on find/count operations.
   *
   * For delete/deleteMany operations on soft-deletable models, converts them
   * to an update that sets `deletedAt` to the current timestamp.
   */
  private registerSoftDeleteMiddleware(): void {
    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      const modelName = params.model?.toLowerCase();

      if (!modelName || !SOFT_DELETE_MODELS.has(modelName)) {
        return next(params);
      }

      // ── Read operations: inject deletedAt: null filter ─────────────────────
      if (
        [
          'findFirst',
          'findMany',
          'findUnique',
          'findUniqueOrThrow',
          'findFirstOrThrow',
          'count',
          'aggregate',
          'groupBy',
        ].includes(params.action)
      ) {
        params.args = params.args ?? {};
        params.args.where = params.args.where ?? {};

        // Only inject if caller has not explicitly asked for deleted records
        if (!('deletedAt' in params.args.where)) {
          params.args.where.deletedAt = null;
        }
      }

      // ── Hard-delete → soft-delete conversion ───────────────────────────────
      if (params.action === 'delete') {
        params.action = 'update';
        params.args = params.args ?? {};
        params.args.data = { deletedAt: new Date() };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args = params.args ?? {};
        params.args.data = { deletedAt: new Date() };
      }

      return next(params);
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Transaction Helper
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Runs `fn` inside a Prisma interactive transaction with configurable
   * timeout and max-wait settings. Retries the transaction up to `maxRetries`
   * times on serialization failures (error code P2034).
   *
   * @example
   * await prismaService.runInTransaction(async (tx) => {
   *   await tx.employee.create({ ... });
   *   await tx.auditLog.create({ ... });
   * });
   */
  async runInTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      maxRetries?: number;
    },
  ): Promise<T> {
    const { maxWait = 5000, timeout = 10000, maxRetries = 3 } = options ?? {};
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await this.$transaction(fn, { maxWait, timeout });
      } catch (error) {
        attempt++;

        const isSerializationError =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';

        if (isSerializationError && attempt < maxRetries) {
          this.logger.warn(
            `Transaction serialization failure (attempt ${attempt}/${maxRetries}). Retrying...`,
          );
          // Exponential back-off: 50ms, 100ms, 200ms, ...
          await new Promise((resolve) =>
            setTimeout(resolve, 50 * Math.pow(2, attempt - 1)),
          );
          continue;
        }

        throw error;
      }
    }

    // TypeScript requires a return here even though the loop always throws
    throw new Error('Transaction failed after maximum retry attempts.');
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Utility: Health Check
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Executes a cheap ping query to verify DB connectivity.
   * Used by the health-check endpoint.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
