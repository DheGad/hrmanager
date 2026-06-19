import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LlmService } from '../../shared/llm/llm.service';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private llm: LlmService,
  ) {}

  async createConversation(tenantId: string, userId: string, title?: string) {
    return this.prisma.aiConversation.create({
      data: { tenantId, userId, title: title || 'New Conversation' },
    });
  }

  async getConversations(tenantId: string, userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { tenantId, userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async *queryStream(tenantId: string, userId: string, conversationId: string, question: string) {
    // 1. Save user message
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        tenantId,
        userId,
        role: 'USER',
        content: question,
      },
    });

    try {
      // 2. Generate embedding for the question
      const questionEmbedding = await this.llm.generateEmbedding(question);

      // 3. Vector Search using pgvector
      // Match within the tenant's docs OR global system docs (is_system_document = true)
      const matches: any[] = await this.prisma.$queryRaw`
        SELECT 
          c.id as chunk_id, 
          c.content, 
          kb.name as source_name,
          kb.id as knowledge_base_id,
          1 - (c.embedding <=> \${questionEmbedding}::vector) as similarity
        FROM document_chunks c
        JOIN knowledge_bases kb ON c.knowledge_base_id = kb.id
        WHERE kb.tenant_id = \${tenantId} OR kb.is_system_document = true
        ORDER BY c.embedding <=> \${questionEmbedding}::vector
        LIMIT 5;
      `;

      // 4. Construct Prompt Context
      let contextText = '';
      const citations = [];
      const sourcesUsed = new Set<string>();

      // Strict Enterprise Guardrail: Threshold < 0.75 rejection
      const MIN_SIMILARITY_THRESHOLD = 0.75;
      
      for (const match of matches) {
        if (match.similarity >= MIN_SIMILARITY_THRESHOLD) {
          contextText += `--- SOURCE: \${match.source_name} ---\\n\${match.content}\\n\\n`;
          citations.push({
            sourceName: match.source_name,
            excerpt: match.content.substring(0, 150) + '...',
            similarity: Math.round(match.similarity * 100) / 100
          });
          sourcesUsed.add(match.knowledge_base_id);
        }
      }

      if (citations.length === 0) {
        // Fallback: If no document matches the threshold, reject the hallucination immediately.
        yield { data: JSON.stringify({ type: 'content', content: "I don't know. The requested information is not available in the company policies." }) };
        yield { data: JSON.stringify({ type: 'done', citations: [] }) };
        return;
      }

      const systemPrompt = `You are the HRManager4U.ai Legal Assistant. 
You provide HR and compliance advice for SMEs.
You MUST base your answers ONLY on the provided context. If the answer is not in the context, say "I cannot answer this based on the available policies."
Always cite the source name when providing an answer.

CONTEXT:
\${contextText}`;

      // 5. Call Chat API with Streaming (provider-agnostic)
      let fullResponse = '';

      // 6. Stream chunks back to client via SSE
      for await (const content of this.llm.streamText(question, systemPrompt)) {
        fullResponse += content;
        yield { data: JSON.stringify({ type: 'content', content }) };
      }

      // 7. Save Assistant message and Citations
      await this.prisma.aiMessage.create({
        data: {
          conversationId,
          tenantId,
          userId,
          role: 'ASSISTANT',
          content: fullResponse,
          citations,
          sourcesUsed: Array.from(sourcesUsed),
        },
      });

      // 8. Audit Logging
      this.auditService.log({
        action: 'AI_QUERY',
        resource: 'AiMessage',
        tenantId,
        userId,
        description: 'User queried AI HR Assistant',
        aiPrompt: question,
        aiResponse: fullResponse,
        aiSourceDocuments: citations,
      });

      // 9. Send final metadata (citations) to client
      yield { data: JSON.stringify({ type: 'done', citations }) };

    } catch (error: any) {
      this.logger.error('RAG Pipeline Error', error);
      yield { data: JSON.stringify({ type: 'error', content: 'An error occurred while generating the response.' }) };
    }
  }

  async query(tenantId: string, userId: string, question: string, conversationId?: string) {
    try {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const conv = await this.createConversation(tenantId, userId, question.substring(0, 30) + '...');
        activeConversationId = conv.id;
      }

      await this.prisma.aiMessage.create({
        data: {
          conversationId: activeConversationId,
          tenantId,
          userId,
          role: 'USER',
          content: question,
        },
      });
      // Check if AI is configured at all
      const openaiKey = await this.llm['configProvider'].get('OPENAI_API_KEY').catch(() => '');
      const openrouterKey = await this.llm['configProvider'].get('OPENROUTER_API_KEY').catch(() => '');
      const aiProvider = await this.llm['configProvider'].get('AI_PROVIDER').catch(() => 'openai');
      const isMockKey = openaiKey === 'sk-mock-12345' || openaiKey === '';
      const aiNotConfigured = (aiProvider !== 'openrouter' && isMockKey) || (aiProvider === 'openrouter' && !openrouterKey);
      
      if (aiNotConfigured) {
        await this.prisma.aiMessage.create({
          data: {
            conversationId: activeConversationId,
            tenantId,
            userId,
            role: 'ASSISTANT',
            content: '⚠️ The AI Assistant is not yet configured. Please ask your administrator to add an OpenAI or OpenRouter API key in the Control Center → AI Settings.',
            confidence: 0,
            citations: [],
          },
        });
        return {
          answer: '⚠️ The AI Assistant is not yet configured. Please ask your administrator to add an OpenAI or OpenRouter API key in the Control Center → AI Settings.',
          confidence: 0,
          citations: [],
          conversationId: activeConversationId,
        };
      }


      const questionEmbedding = await this.llm.generateEmbedding(question);
      // Format as postgres vector literal string
      const vectorLiteral = `[${questionEmbedding.join(',')}]`;

      // 2. Vector Search — use $queryRawUnsafe to pass vector literal correctly
      const matches: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT 
          c.id as chunk_id, 
          c.content, 
          c.page_number,
          c.section_title as clause,
          kb.name as document,
          1 - (c.embedding <=> '${vectorLiteral}'::vector) as similarity
        FROM document_chunks c
        JOIN knowledge_bases kb ON c.knowledge_base_id = kb.id
        WHERE kb.tenant_id = '${tenantId}' OR kb.is_system_document = true
        ORDER BY c.embedding <=> '${vectorLiteral}'::vector
        LIMIT 5
      `);

      let contextText = '';
      const citations = [];
      let maxConfidence = 0;

      for (const match of matches) {
        if (match.similarity > maxConfidence) maxConfidence = match.similarity;

        if (match.similarity >= 0.75) {
          contextText += `--- SOURCE: ${match.document} (Clause: ${match.clause || 'N/A'}, Page: ${match.page_number || 'N/A'}) ---\n${match.content}\n\n`;
          citations.push({
            document: match.document,
            clause: match.clause || 'N/A',
            page: match.page_number || 1,
            excerpt: match.content.substring(0, 200) + '...'
          });
        }
      }

      // If no high-confidence doc matches, still answer via LLM with built-in knowledge
      // but flag lower confidence
      if (citations.length === 0) {
        const fallbackSystemPrompt = `You are the HRManager4U.ai HR Assistant, an expert in HR law, employment regulations, and workplace policies for Malaysia and Australia.
Answer the user's HR-related question helpfully and accurately using your built-in knowledge of employment law.
Always clarify that your answer is based on general HR knowledge, not company-specific policies.
If the question is not HR-related, politely redirect the user to ask HR questions.`;

        const fallbackAnswer = await this.llm.generateText(question, fallbackSystemPrompt);
        
        return {
          answer: fallbackAnswer,
          confidence: 0.6,
          citations: [],
          conversationId: activeConversationId,
        };
      }

      // 3. Prompt GPT
      const systemPrompt = `You are the HRManager4U.ai Legal Assistant. 
You provide HR and compliance advice for SMEs based ONLY on the provided context. 
If the answer is not in the context, say "I don't know". Do not hallucinate.

CONTEXT:
${contextText}`;

      const answer = await this.llm.generateText(question, systemPrompt);

      // 4. Audit
      this.auditService.log({
        action: 'AI_QUERY_SYNC',
        resource: 'AiApi',
        tenantId,
        userId,
        description: 'Synchronous AI Query executed',
        aiPrompt: question,
        aiResponse: answer,
        aiSourceDocuments: citations,
      });

      await this.prisma.aiMessage.create({
        data: {
          conversationId: activeConversationId,
          tenantId,
          userId,
          role: 'ASSISTANT',
          content: answer,
          citations,
          confidence: Math.round(maxConfidence * 100) / 100,
          modelUsed: await this.llm.getChatModelName(),
          sourcesUsed: Array.from(new Set(citations.map(c => c.document))),
        },
      });

      return {
        answer,
        confidence: Math.round(maxConfidence * 100) / 100,
        citations,
        conversationId: activeConversationId,
      };

    } catch (error) {
      this.logger.error('Query failed', error);
      throw error;
    }
  }
}
