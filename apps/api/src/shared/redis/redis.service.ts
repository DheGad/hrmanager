import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { AppConfig } from '../../config/configuration';

/**
 * RedisService — production-grade ioredis wrapper.
 *
 * Design decisions:
 *  - A single shared ioredis client is created at module init and reused for
 *    all operations. ioredis handles automatic reconnection internally.
 *  - All methods are fully typed and never expose the raw client to callers.
 *  - JSON helpers (setJson / getJson) use generics so callers stay type-safe.
 *  - flushPattern uses SCAN + pipeline-DEL to avoid blocking the Redis event
 *    loop with KEYS on large keyspaces.
 *  - OnModuleDestroy disconnects gracefully so integration tests don't hang.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  onModuleInit(): void {
    const { host, port, password, db } =
      this.configService.get<AppConfig['redis']>('redis');

    const options: RedisOptions = {
      host,
      port,
      db,
      // Only supply password when it is actually configured
      ...(password ? { password } : {}),
      // Reconnect with exponential back-off, capped at 30 s
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 200, 30_000);
        this.logger.warn(
          `Redis reconnect attempt #${times} — next try in ${delay}ms`,
        );
        return delay;
      },
      // Surface connection errors without crashing the process
      lazyConnect: false,
      enableOfflineQueue: true,
      maxRetriesPerRequest: 3,
      connectTimeout: 10_000,
    };

    this.client = new Redis(options);

    this.client.on('connect', () =>
      this.logger.log(`Redis connected → ${host}:${port} db=${db}`),
    );

    this.client.on('error', (err: Error) =>
      this.logger.error(`Redis connection error: ${err.message}`, err.stack),
    );

    this.client.on('reconnecting', () =>
      this.logger.warn('Redis is reconnecting…'),
    );

    this.client.on('close', () =>
      this.logger.warn('Redis connection closed'),
    );
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
      this.logger.log('Redis connection closed gracefully');
    } catch (err) {
      // Force-disconnect if QUIT command times out
      this.client.disconnect();
      this.logger.error(
        'Redis quit failed — force-disconnected',
        (err as Error).stack,
      );
    }
  }

  // ─── Expose raw client for advanced use-cases (use sparingly) ────────────

  getClient(): Redis {
    return this.client;
  }

  // ─── String operations ────────────────────────────────────────────────────

  /**
   * Retrieve a string value by key.
   * Returns null when the key does not exist.
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Set a string value, optionally with a TTL in seconds.
   * When ttlSeconds is omitted the key persists until explicitly deleted.
   */
  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    if (ttlSeconds !== undefined && ttlSeconds > 0) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Delete one or multiple keys in a single round-trip.
   */
  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length === 0) return;
    await this.client.del(...keys);
  }

  /**
   * Returns true when the key exists in Redis.
   */
  async exists(key: string): Promise<boolean> {
    const count = await this.client.exists(key);
    return count > 0;
  }

  /**
   * Set/update the TTL on an existing key.
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  /**
   * Returns the remaining TTL of a key in seconds.
   * -1 = key has no expiry, -2 = key does not exist.
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // ─── Hash operations ──────────────────────────────────────────────────────

  /**
   * Get a single field from a hash.
   * Returns null when the field does not exist.
   */
  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  /**
   * Set a single field in a hash.
   */
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  /**
   * Return all fields and values of a hash.
   * Returns an empty object when the key does not exist.
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    const result = await this.client.hgetall(key);
    return result ?? {};
  }

  /**
   * Delete one or more hash fields.
   */
  async hdel(key: string, ...fields: string[]): Promise<void> {
    if (fields.length === 0) return;
    await this.client.hdel(key, ...fields);
  }

  // ─── List operations ──────────────────────────────────────────────────────

  /**
   * Prepend one or more values to a list.
   */
  async lpush(key: string, ...values: string[]): Promise<void> {
    if (values.length === 0) return;
    await this.client.lpush(key, ...values);
  }

  /**
   * Append one or more values to a list.
   */
  async rpush(key: string, ...values: string[]): Promise<void> {
    if (values.length === 0) return;
    await this.client.rpush(key, ...values);
  }

  /**
   * Get a range of elements from a list.
   * Use lrange(key, 0, -1) to get all elements.
   */
  async lrange(
    key: string,
    start: number,
    stop: number,
  ): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  // ─── Atomic counter ───────────────────────────────────────────────────────

  /**
   * Atomically increment an integer counter by 1 and return the new value.
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Atomically increment an integer counter by the given amount.
   */
  async incrby(key: string, increment: number): Promise<number> {
    return this.client.incrby(key, increment);
  }

  // ─── JSON helpers ─────────────────────────────────────────────────────────

  /**
   * Serialize `value` to JSON and store it in Redis with an optional TTL.
   */
  async setJson<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  /**
   * Retrieve a JSON-serialized value and deserialize it.
   * Returns null when the key does not exist or JSON parsing fails.
   */
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(
        `getJson: failed to parse value for key "${key}": ${(err as Error).message}`,
      );
      return null;
    }
  }

  // ─── Pattern matching ─────────────────────────────────────────────────────

  /**
   * Returns all keys matching a glob-style pattern.
   *
   * ⚠️  Uses KEYS internally — only safe for small keyspaces or admin/debug use.
   *     For large keyspaces prefer flushPattern (SCAN-based) or avoid entirely.
   */
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  /**
   * Delete all keys matching a glob-style pattern.
   *
   * Uses SCAN + pipeline DEL so the operation is non-blocking even for very
   * large keyspaces. Returns the total number of deleted keys.
   */
  async flushPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let deletedCount = 0;

    do {
      const [nextCursor, matchedKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (matchedKeys.length > 0) {
        const pipeline = this.client.pipeline();
        matchedKeys.forEach((key) => pipeline.del(key));
        const results = await pipeline.exec();
        // Each result is [error, reply]; count successful deletes
        if (results) {
          deletedCount += results.filter(([err]) => err === null).length;
        }
      }
    } while (cursor !== '0');

    if (deletedCount > 0) {
      this.logger.debug(
        `flushPattern("${pattern}"): deleted ${deletedCount} key(s)`,
      );
    }

    return deletedCount;
  }

  // ─── Pub/Sub convenience ──────────────────────────────────────────────────

  /**
   * Publish a message to a channel.
   * Returns the number of subscribers that received the message.
   */
  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  // ─── Health check ─────────────────────────────────────────────────────────

  /**
   * Ping the Redis server — returns true when the connection is healthy.
   */
  async ping(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
