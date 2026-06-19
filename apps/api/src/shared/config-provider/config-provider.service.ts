import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ConfigProviderService {
  private readonly logger = new Logger(ConfigProviderService.name);
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const rawKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (rawKey) {
      // Must be 32 bytes for aes-256-cbc. If it's not, we pad/truncate.
      this.encryptionKey = Buffer.alloc(32, rawKey, 'utf-8');
    } else {
      // Fallback dummy key for dev environments if not provided, just to prevent crashing.
      this.encryptionKey = Buffer.alloc(32, 'dev_dummy_encryption_key_12345678', 'utf-8');
    }
  }

  async get(key: string, tenantId: string | null = null): Promise<string | undefined> {
    const enableControlCenter = this.configService.get<string>('ENABLE_CONTROL_CENTER') === 'true';

    // 1. Try fetching from DB if Control Center is enabled
    if (enableControlCenter) {
      try {
        let setting = null;
        
        // Check for tenant-specific setting first
        if (tenantId) {
          setting = await this.prisma.systemSetting.findUnique({
            where: {
              tenantId_key: { tenantId, key },
            },
          });
        }

        // Fallback to global setting
        if (!setting) {
          setting = await this.prisma.systemSetting.findFirst({
            where: {
              tenantId: null,
              key,
            },
          });
        }

        if (setting) {
          if (setting.isSecret) {
            return this.decrypt(setting.value);
          }
          return setting.value;
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch dynamic configuration for key [${key}]. Falling back to ENV.`);
      }
    }

    // 2. Fallback to process.env / configService
    return this.configService.get<string>(key);
  }

  async set(key: string, value: string, category: string, isSecret = false, tenantId: string | null = null, updatedBy?: string): Promise<void> {
    const finalValue = isSecret ? this.encrypt(value) : value;

    // Use upsert to create or update
    await this.prisma.systemSetting.upsert({
      where: {
        tenantId_key: tenantId ? { tenantId, key } : { tenantId: 'global', key }, // Note: Prisma unique null constraints can be tricky. We might just search.
      },
      update: {
        value: finalValue,
        isSecret,
        category,
        updatedBy,
      },
      create: {
        tenantId,
        key,
        value: finalValue,
        isSecret,
        category,
        updatedBy,
      },
    });
  }

  // NOTE: Prisma uniqueness with null values (like tenantId = null) is handled correctly in Postgres,
  // but Prisma's `upsert` requires a strictly unique condition. We should probably use a custom helper for the set method.
  async setSecure(key: string, value: string, category: string, isSecret = false, tenantId: string | null = null, updatedBy?: string): Promise<void> {
    const finalValue = isSecret ? this.encrypt(value) : value;
    
    if (tenantId) {
      await this.prisma.systemSetting.upsert({
        where: { tenantId_key: { tenantId, key } },
        update: { value: finalValue, isSecret, category, updatedBy },
        create: { tenantId, key, value: finalValue, isSecret, category, updatedBy },
      });
    } else {
      const existing = await this.prisma.systemSetting.findFirst({ where: { tenantId: null, key } });
      if (existing) {
        await this.prisma.systemSetting.update({
          where: { id: existing.id },
          data: { value: finalValue, isSecret, category, updatedBy },
        });
      } else {
        await this.prisma.systemSetting.create({
          data: { tenantId: null, key, value: finalValue, isSecret, category, updatedBy },
        });
      }
    }
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
      let decrypted = decipher.update(encryptedText, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      this.logger.error('Failed to decrypt value');
      return text; // Return raw text if decryption fails (e.g., if someone inserted raw text directly in the DB)
    }
  }
}
