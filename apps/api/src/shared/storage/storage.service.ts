import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { AppConfig } from '../../config/configuration';

// ─── Domain types ─────────────────────────────────────────────────────────────

/**
 * Logical storage categories that determine the sub-path within a tenant prefix.
 * Adding a new category here automatically propagates to generateKey().
 */
export enum StorageCategory {
  DOCUMENTS = 'documents',
  KNOWLEDGE_BASE = 'knowledge-base',
  AVATARS = 'avatars',
  REPORTS = 'reports',
  TEMPLATES = 'templates',
  EXPORTS = 'exports',
}

export interface UploadFileParams {
  /** Raw buffer or readable stream to upload */
  file: Buffer | Readable;
  /** Full object key (path) within the bucket */
  key: string;
  /** MIME type of the file, e.g. 'application/pdf' */
  mimeType: string;
  /** Optional content length in bytes — required when streaming to S3 */
  size?: number;
  /** Arbitrary string→string metadata stored with the object */
  metadata?: Record<string, string>;
  /** S3 canned ACL. Defaults to 'private'. */
  acl?: 'private' | 'public-read';
}

export interface UploadedFile {
  /** Full S3 object key */
  key: string;
  /** Direct S3 URL (may require auth in private buckets) */
  url: string;
  /** CDN-fronted URL, populated when STORAGE_CDN_URL is configured */
  cdnUrl?: string;
  /** Size of the uploaded object in bytes */
  size: number;
  /** MIME type reported back from S3 */
  mimeType: string;
  /** ETag returned by S3 (MD5 of the object content) */
  etag: string;
}

export interface FileMetadata {
  key: string;
  size: number;
  mimeType: string;
  etag: string;
  lastModified: Date;
  metadata: Record<string, string>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * StorageService — S3-compatible object storage abstraction.
 *
 * Design decisions:
 *  - A single S3Client is created at construction time using the STORAGE_*
 *    config values. The same client handles both AWS S3 (production) and MinIO
 *    (development) through the endpoint / forcePathStyle options.
 *  - All public methods accept/return our own domain types — callers never
 *    touch S3 SDK types directly.
 *  - Signed URL expiry defaults to 3600 s (1 hour) but can be overridden.
 *  - deleteFiles uses the S3 batch delete API (up to 1000 keys per call) for
 *    efficiency; it batches automatically if >1000 keys are supplied.
 *  - generateKey produces deterministic, collision-safe, tenant-namespaced paths.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly bucketEndpoint: string;
  private readonly cdnUrl: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const storage =
      this.configService.get<AppConfig['storage']>('storage');

    const protocol = storage.useSsl ? 'https' : 'http';
    // For MinIO the endpoint contains host+port; for AWS it is a regional URL
    const endpoint = storage.port
      ? `${protocol}://${storage.endpoint}:${storage.port}`
      : `${protocol}://${storage.endpoint}`;

    this.bucketName = storage.bucketName;
    this.cdnUrl = storage.cdnUrl ?? '';
    this.bucketEndpoint = endpoint;

    this.s3 = new S3Client({
      endpoint,
      region: storage.region,
      credentials: {
        accessKeyId: storage.accessKey,
        secretAccessKey: storage.secretKey,
      },
      // Required for MinIO — path-style URLs: http://host:port/bucket/key
      // AWS S3 uses virtual-hosted style by default (bucket.s3.amazonaws.com)
      forcePathStyle: true,
    });

    this.logger.log(
      `StorageService initialised → bucket="${this.bucketName}" endpoint="${endpoint}"`,
    );
  }

  // ─── Upload ──────────────────────────────────────────────────────────────

  /**
   * Upload a file (Buffer or Readable stream) using a pre-computed key.
   * Returns a fully-populated UploadedFile descriptor.
   */
  async uploadFile(params: UploadFileParams): Promise<UploadedFile> {
    const {
      file,
      key,
      mimeType,
      size,
      metadata = {},
      acl = 'private',
    } = params;

    const input: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
      Metadata: metadata,
      // Only set ACL when explicitly requested as public — omit for private
      ...(acl === 'public-read' ? { ACL: acl } : {}),
      ...(size !== undefined ? { ContentLength: size } : {}),
    };

    const command = new PutObjectCommand(input);
    const response = await this.s3.send(command);

    const etag = (response.ETag ?? '').replace(/"/g, '');
    const objectSize = size ?? (Buffer.isBuffer(file) ? file.length : 0);
    const url = this.buildDirectUrl(key);

    this.logger.debug(`Uploaded s3://${this.bucketName}/${key} (${objectSize} bytes)`);

    return {
      key,
      url,
      ...(this.cdnUrl ? { cdnUrl: this.buildCdnUrl(key) } : {}),
      size: objectSize,
      mimeType,
      etag,
    };
  }

  /**
   * Convenience overload: upload a Buffer with explicit MIME type.
   * The key must be generated beforehand via generateKey().
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    mimeType: string,
    metadata?: Record<string, string>,
  ): Promise<UploadedFile> {
    return this.uploadFile({
      file: buffer,
      key,
      mimeType,
      size: buffer.length,
      metadata,
    });
  }

  // ─── Pre-signed URLs ─────────────────────────────────────────────────────

  /**
   * Generate a pre-signed GET URL valid for `expiresInSeconds` (default 3600 s).
   * The URL allows unauthenticated HTTP GET access to a private object.
   */
  async getSignedUrl(
    key: string,
    expiresInSeconds = 3_600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  /**
   * Delete a single object from the bucket.
   * Silently succeeds when the object does not exist (S3 DELETE is idempotent).
   */
  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
    );
    this.logger.debug(`Deleted s3://${this.bucketName}/${key}`);
  }

  /**
   * Delete multiple objects in efficient batches of up to 1000 keys.
   * S3 batch-delete costs 1 request per 1000 objects — far cheaper than
   * issuing individual DeleteObject calls in a loop.
   */
  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const BATCH_SIZE = 1_000;
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = keys.slice(i, i + BATCH_SIZE);
      await this.s3.send(
        new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: {
            Objects: batch.map((k) => ({ Key: k })),
            Quiet: true, // suppress individual success responses
          },
        }),
      );
    }

    this.logger.debug(`Batch-deleted ${keys.length} object(s) from S3`);
  }

  // ─── Metadata / Existence ────────────────────────────────────────────────

  /**
   * Returns true when the object exists in the bucket.
   * Uses HeadObject — does NOT download the body.
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
      return true;
    } catch (err: unknown) {
      // SDK v3 wraps the 404 as a named error
      if (
        err instanceof Error &&
        (err.name === 'NotFound' || err.name === 'NoSuchKey')
      ) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Retrieve metadata for an object without downloading its body.
   * Returns null when the object does not exist.
   */
  async getFileMetadata(key: string): Promise<FileMetadata | null> {
    let head: HeadObjectCommandOutput;
    try {
      head = await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.name === 'NotFound' || err.name === 'NoSuchKey')
      ) {
        return null;
      }
      throw err;
    }

    return {
      key,
      size: head.ContentLength ?? 0,
      mimeType: head.ContentType ?? 'application/octet-stream',
      etag: (head.ETag ?? '').replace(/"/g, ''),
      lastModified: head.LastModified ?? new Date(0),
      metadata: (head.Metadata as Record<string, string>) ?? {},
    };
  }

  // ─── Copy ─────────────────────────────────────────────────────────────────

  /**
   * Server-side copy from sourceKey to destKey within the same bucket.
   * Efficient — no data transfer through the application.
   */
  async copyFile(sourceKey: string, destKey: string): Promise<void> {
    await this.s3.send(
      new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destKey,
      }),
    );
    this.logger.debug(
      `Copied s3://${this.bucketName}/${sourceKey} → ${destKey}`,
    );
  }

  // ─── Key generation ───────────────────────────────────────────────────────

  /**
   * Build a collision-safe, tenant-namespaced object key.
   *
   * Format: `{tenantId}/{category}/{year}/{month}/{uuid}-{sanitizedFilename}`
   *
   * Example: `tenant-abc/documents/2026/06/550e8400-e29b-41d4-a716-446655440000-contract.pdf`
   *
   * Benefits:
   *  - Multi-tenant isolation via the tenantId prefix (IAM policies can be
   *    scoped to prefix).
   *  - Year/month sharding avoids listing millions of objects under a single
   *    prefix over time.
   *  - UUID prefix guarantees uniqueness even for identical filenames.
   *  - Filename sanitisation removes characters that cause S3 / CDN issues.
   */
  generateKey(
    tenantId: string,
    category: StorageCategory,
    filename: string,
  ): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const sanitized = this.sanitizeFilename(filename);
    const id = uuidv4();
    return `${tenantId}/${category}/${year}/${month}/${id}-${sanitized}`;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Strip characters that cause issues in S3 keys or CDN URLs:
   *   - Replace spaces with hyphens
   *   - Remove anything outside [a-zA-Z0-9._-]
   *   - Collapse consecutive hyphens
   *   - Lowercase the result for canonical comparison
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/-{2,}/g, '-')
      .toLowerCase();
  }

  /** Constructs the direct S3 URL for the object (may require auth). */
  private buildDirectUrl(key: string): string {
    return `${this.bucketEndpoint}/${this.bucketName}/${key}`;
  }

  /** Constructs a CDN-fronted URL when STORAGE_CDN_URL is configured. */
  private buildCdnUrl(key: string): string {
    return `${this.cdnUrl.replace(/\/$/, '')}/${key}`;
  }
}
