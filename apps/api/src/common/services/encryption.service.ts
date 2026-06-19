import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const rawKey = this.configService.get<string>('encryption.key') || '0123456789abcdef0123456789abcdef';
    // Ensure key is exactly 32 bytes for AES-256
    this.key = Buffer.from(rawKey.padEnd(32, '0').slice(0, 32), 'utf8');
  }

  encrypt(text: string | null | undefined): string | null {
    if (!text) return null;
    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');
      
      // Format: iv:authTag:encryptedText
      return `\${iv.toString('hex')}:\${authTag}:\${encrypted}`;
    } catch (e) {
      this.logger.error('Encryption failed', e);
      throw new Error('Data encryption failed');
    }
  }

  decrypt(encryptedText: string | null | undefined): string | null {
    if (!encryptedText) return null;
    
    // Check if it's actually encrypted (prevents crashes on legacy unencrypted data)
    if (!encryptedText.includes(':')) {
      return encryptedText;
    }

    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) return encryptedText;

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (e) {
      this.logger.error('Decryption failed', e);
      return '[DECRYPTION_FAILED]'; // Don't crash the app, but don't return garbage
    }
  }
}
