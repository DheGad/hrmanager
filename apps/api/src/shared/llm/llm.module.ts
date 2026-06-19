import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';

/**
 * LlmModule — Global infrastructure module.
 *
 * Provides a single, application-scoped LlmService backed by the OpenAI SDK.
 * The service exposes both streaming and non-streaming chat completions, as
 * well as text embeddings with built-in rate-limiting and cost tracking.
 *
 * Exported globally so every domain module can inject LlmService without
 * re-importing this module.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
