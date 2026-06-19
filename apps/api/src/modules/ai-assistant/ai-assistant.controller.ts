import { Controller, Get, Post, Body, Param, Req, Sse, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiAssistantService } from './ai-assistant.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@ApiTags('AI Assistant')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Controller({ version: '1', path: 'ai' })
export class AiAssistantController {
  constructor(private readonly aiService: AiAssistantService) {}

  @Post('conversations')
  createConversation(@CurrentTenant() tenantId: string, @Req() req: any, @Body() dto: any) {
    return this.aiService.createConversation(tenantId, req.user.userId, dto.title);
  }

  @Get('conversations')
  getConversations(@CurrentTenant() tenantId: string, @Req() req: any) {
    return this.aiService.getConversations(tenantId, req.user.userId);
  }

  @Post('query')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async query(@CurrentTenant() tenantId: string, @Req() req: any, @Body() dto: { question: string, conversationId?: string }) {
    return this.aiService.query(tenantId, req.user?.userId || req.user?.id || 'system', dto.question, dto.conversationId);
  }

  @Sse('conversations/:id/stream')
  streamResponse(
    @CurrentTenant() tenantId: string,
    @Req() req: any,
    @Param('id') conversationId: string,
    @Query('question') question: string,
  ) {
    return this.aiService.queryStream(tenantId, req.user.id, conversationId, question);
  }
}
