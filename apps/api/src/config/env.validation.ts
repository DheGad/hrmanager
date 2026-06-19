import * as Joi from 'joi';

/**
 * Joi validation schema for all environment variables used by the application.
 *
 * Convention:
 *  - .required()           → must be present with a non-empty value
 *  - .default(value)       → optional with a sensible fallback
 *  - .valid(...)           → restricts to an enum of acceptable values
 *
 * Sensitive fields (keys, passwords) are typed as string without further
 * format enforcement to accommodate different secret management strategies
 * (e.g., base64, raw PEM).
 */
export const validationSchema = Joi.object({
  // ─── Application ────────────────────────────────────────────────────────────
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .required()
    .description('Runtime environment identifier'),

  API_PORT: Joi.number().port().default(4000),
  API_HOST: Joi.string().hostname().default('0.0.0.0'),
  APP_URL: Joi.string().uri().default('http://localhost:4000'),
  APP_NAME: Joi.string().default('HRManager4U API'),

  // ─── JWT (RS256) ────────────────────────────────────────────────────────────
  JWT_PRIVATE_KEY: Joi.string()
    .required()
    .description('Base64-encoded RS256 private key for signing JWTs'),

  JWT_PUBLIC_KEY: Joi.string()
    .required()
    .description('Base64-encoded RS256 public key for verifying JWTs'),

  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // ─── Database ────────────────────────────────────────────────────────────────
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required()
    .description('Full Prisma PostgreSQL connection string'),

  DB_HOST: Joi.string().hostname().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_NAME: Joi.string().default('hrmanager4u'),
  DB_USER: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().allow('').default(''),

  // ─── Redis ───────────────────────────────────────────────────────────────────
  REDIS_HOST: Joi.string()
    .hostname()
    .required()
    .description('Redis server hostname'),

  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().integer().min(0).max(15).default(0),
  REDIS_TTL: Joi.number().integer().min(1).default(3600),

  // ─── Object Storage (MinIO / S3-compatible) ──────────────────────────────────
  STORAGE_ENDPOINT: Joi.string().default('localhost'),
  STORAGE_PORT: Joi.number().port().default(9000),
  STORAGE_USE_SSL: Joi.string().valid('true', 'false', '1', '0').default('false'),
  STORAGE_ACCESS_KEY: Joi.string().allow('').default(''),
  STORAGE_SECRET_KEY: Joi.string().allow('').default(''),
  STORAGE_BUCKET_NAME: Joi.string().default('hrmanager4u'),
  STORAGE_REGION: Joi.string().default('us-east-1'),
  STORAGE_CDN_URL: Joi.string().uri().allow('').default(''),

  // ─── AI Provider (multi-provider support) ────────────────────────────────────
  // AI_PROVIDER controls which chat backend to use:
  //   'openai'     → direct OpenAI (requires OPENAI_API_KEY)
  //   'openrouter' → OpenRouter proxy (requires OPENROUTER_API_KEY, routes to any model)
  //   'azure'      → Azure OpenAI (requires AZURE_OPENAI_* vars)
  AI_PROVIDER: Joi.string()
    .valid('openai', 'openrouter', 'azure')
    .default('openai')
    .description('AI backend provider'),

  AI_CHAT_MODEL: Joi.string()
    .allow('')
    .default('')
    .description('Override chat model (e.g. google/gemini-2.5-flash for OpenRouter)'),

  AI_EMBEDDING_MODEL: Joi.string()
    .allow('')
    .default('')
    .description('Override embedding model (e.g. jina-embeddings-v3 for Jina AI)'),

  // OpenAI (optional when using OpenRouter or Azure)
  OPENAI_API_KEY: Joi.string()
    .allow('')
    .default('')
    .description('OpenAI API key — optional if using OpenRouter/Azure'),

  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
  OPENAI_EMBEDDING_MODEL: Joi.string().default('text-embedding-3-small'),
  OPENAI_MAX_TOKENS: Joi.number().integer().min(1).max(128000).default(4096),
  OPENAI_TEMPERATURE: Joi.number().min(0).max(2).default(0.2),

  // OpenRouter (optional — alternative to OpenAI for chat)
  OPENROUTER_API_KEY: Joi.string().allow('').default(''),

  // Azure OpenAI (optional)
  AZURE_OPENAI_API_KEY: Joi.string().allow('').default(''),
  AZURE_OPENAI_ENDPOINT: Joi.string().allow('').default(''),
  AZURE_OPENAI_DEPLOYMENT: Joi.string().allow('').default('gpt-4o'),

  // Jina AI (optional — free embedding alternative, 1536-dim compatible)
  AI_JINA_API_KEY: Joi.string().allow('').default(''),

  // ─── SMTP ────────────────────────────────────────────────────────────────────
  SMTP_HOST: Joi.string().default('smtp.mailtrap.io'),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.string().valid('true', 'false', '1', '0').default('false'),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_FROM_NAME: Joi.string().default('HRManager4U'),
  SMTP_FROM_EMAIL: Joi.string().email().default('noreply@hrmanager4u.ai'),

  // ─── Throttling ──────────────────────────────────────────────────────────────
  THROTTLE_TTL: Joi.number().integer().min(1).default(60),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(100),
  THROTTLE_AI_LIMIT: Joi.number().integer().min(1).default(20),

  // ─── CORS ────────────────────────────────────────────────────────────────────
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.string().valid('true', 'false', '1', '0').default('true'),

  // ─── Encryption ──────────────────────────────────────────────────────────────
  ENCRYPTION_KEY: Joi.string()
    .min(32)
    .allow('')
    .default('')
    .description('AES-256 encryption key — must be ≥32 characters in production'),

  ENCRYPTION_IV_LENGTH: Joi.number().integer().valid(12, 16).default(16),
})
  .options({ allowUnknown: true }) // Allow other env vars (e.g., PATH, HOME)
  .unknown(true);
