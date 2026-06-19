import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseProcessor } from './knowledge-base.processor';
import { LlmModule } from '../../shared/llm/llm.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-processing',
    }),
    LlmModule,
  ],
  providers: [KnowledgeBaseService, KnowledgeBaseProcessor],
  controllers: [KnowledgeBaseController],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
