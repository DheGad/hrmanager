import { Module } from '@nestjs/common';
import { HandbookService } from './handbook.service';
import { HandbookController } from './handbook.controller';
import { LlmModule } from '../../shared/llm/llm.module';

@Module({
  imports: [LlmModule],
  providers: [HandbookService],
  controllers: [HandbookController],
  exports: [HandbookService],
})
export class HandbookModule {}
