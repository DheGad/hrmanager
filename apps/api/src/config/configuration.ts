export interface AppConfig {
  app: {
    port: number;
    host: string;
    nodeEnv: string;
    url: string;
    name: string;
  };
  jwt: {
    secret: string;
    privateKey: string;
    publicKey: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
    ttl: number;
  };
  storage: {
    endpoint: string;
    port: number;
    useSsl: boolean;
    accessKey: string;
    secretKey: string;
    bucketName: string;
    region: string;
    cdnUrl: string;
  };
  openai: {
    apiKey: string;
    model: string;
    embeddingModel: string;
    maxTokens: number;
    temperature: number;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
  };
  throttle: {
    ttl: number;
    limit: number;
    aiLimit: number;
  };
  cors: {
    origins: string[];
    credentials: boolean;
  };
  encryption: {
    key: string;
    ivLength: number;
  };
}

/**
 * Decodes a base64-encoded string to UTF-8.
 * Handles both raw base64 and data-URI prefixed strings gracefully.
 */
function decodeBase64(value: string | undefined): string {
  if (!value) return '';
  try {
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch {
    return value;
  }
}

/**
 * Parses a string as boolean.
 * 'true', '1', 'yes' → true; anything else → false.
 */
function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined || value === null) return defaultValue;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

/**
 * Parses a string as integer.
 */
function parseInt10(value: string | undefined, defaultValue: number): number {
  const parsed = parseInt(value ?? '', 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parses a string as float.
 */
function parseFloat10(value: string | undefined, defaultValue: number): number {
  const parsed = parseFloat(value ?? '');
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Root configuration factory. Loaded once at boot and cached by NestJS ConfigModule.
 * All secrets should be base64-encoded in environment variables where noted.
 */
export default (): AppConfig => ({
  app: {
    port: parseInt10(process.env.API_PORT, 4000),
    host: process.env.API_HOST ?? '0.0.0.0',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    url: process.env.APP_URL ?? 'http://localhost:4000',
    name: process.env.APP_NAME ?? 'HRManager4U API',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'super_secret_enterprise_jwt_key_2026',
    // RS256 keys are stored base64-encoded to survive multiline env var issues
    privateKey: decodeBase64(process.env.JWT_PRIVATE_KEY),
    publicKey: decodeBase64(process.env.JWT_PUBLIC_KEY),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  database: {
    url: process.env.DATABASE_URL ?? '',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt10(process.env.DB_PORT, 5432),
    name: process.env.DB_NAME ?? 'hrmanager4u',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt10(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD ?? '',
    db: parseInt10(process.env.REDIS_DB, 0),
    ttl: parseInt10(process.env.REDIS_TTL, 3600),
  },

  storage: {
    endpoint: process.env.STORAGE_ENDPOINT ?? 'localhost',
    port: parseInt10(process.env.STORAGE_PORT, 9000),
    useSsl: parseBoolean(process.env.STORAGE_USE_SSL, false),
    accessKey: process.env.STORAGE_ACCESS_KEY ?? '',
    secretKey: process.env.STORAGE_SECRET_KEY ?? '',
    bucketName: process.env.STORAGE_BUCKET_NAME ?? 'hrmanager4u',
    region: process.env.STORAGE_REGION ?? 'us-east-1',
    cdnUrl: process.env.STORAGE_CDN_URL ?? '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    maxTokens: parseInt10(process.env.OPENAI_MAX_TOKENS, 4096),
    temperature: parseFloat10(process.env.OPENAI_TEMPERATURE, 0.2),
  },

  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.mailtrap.io',
    port: parseInt10(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    fromName: process.env.SMTP_FROM_NAME ?? 'HRManager4U',
    fromEmail: process.env.SMTP_FROM_EMAIL ?? 'noreply@hrmanager4u.ai',
  },

  throttle: {
    ttl: parseInt10(process.env.THROTTLE_TTL, 60),
    limit: parseInt10(process.env.THROTTLE_LIMIT, 100),
    aiLimit: parseInt10(process.env.THROTTLE_AI_LIMIT, 20),
  },

  cors: {
    origins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY ?? '',
    ivLength: parseInt10(process.env.ENCRYPTION_IV_LENGTH, 16),
  },
});
