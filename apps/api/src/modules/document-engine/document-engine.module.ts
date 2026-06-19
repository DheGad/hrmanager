import { Module } from '@nestjs/common';
import { DocumentEngineService } from './document-engine.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DocumentEngineService],
  exports: [DocumentEngineService],
})
export class DocumentEngineModule {}
