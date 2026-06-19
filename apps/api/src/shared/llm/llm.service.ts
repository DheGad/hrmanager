import { Injectable, Logger } from '@nestjs/common';
import { ConfigProviderService } from '../config-provider/config-provider.service';
import OpenAI from 'openai';
import axios from 'axios';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private configProvider: ConfigProviderService) {}

  private async getChatConfig() {
    const provider = await this.configProvider.get('AI_PROVIDER') || 'openai';
    let chatClient: OpenAI;
    let chatModel: string;

    if (provider === 'openrouter') {
      chatClient = new OpenAI({
        apiKey: await this.configProvider.get('OPENROUTER_API_KEY') || '',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://hrmanager4u.ai',
          'X-Title': 'HRManager4U.ai',
        },
      });
      chatModel = await this.configProvider.get('AI_CHAT_MODEL') || 'google/gemini-2.5-flash';
    } else if (provider === 'azure') {
      const apiKey = await this.configProvider.get('AZURE_OPENAI_API_KEY') || '';
      const endpoint = await this.configProvider.get('AZURE_OPENAI_ENDPOINT') || '';
      const deployment = await this.configProvider.get('AZURE_OPENAI_DEPLOYMENT') || 'gpt-4o';
      chatClient = new OpenAI({
        apiKey,
        baseURL: `https://${endpoint}/openai/deployments/${deployment}`,
        defaultQuery: { 'api-version': '2024-02-15-preview' },
        defaultHeaders: { 'api-key': apiKey },
      });
      chatModel = deployment;
    } else {
      chatClient = new OpenAI({
        apiKey: await this.configProvider.get('OPENAI_API_KEY') || '',
      });
      chatModel = await this.configProvider.get('OPENAI_MODEL') || 'gpt-4o-mini';
    }

    return { chatClient, chatModel, provider };
  }

  private async getEmbeddingConfig() {
    const jinaApiKey = await this.configProvider.get('AI_JINA_API_KEY');
    const openAiApiKey = await this.configProvider.get('OPENAI_API_KEY');

    let embeddingClient: OpenAI | null = null;
    let embeddingModel: string;
    let providerName: string;

    if (jinaApiKey) {
      embeddingModel = await this.configProvider.get('AI_EMBEDDING_MODEL') || 'jina-embeddings-v3';
      providerName = 'jina';
    } else if (openAiApiKey && openAiApiKey !== 'sk-mock-12345') {
      embeddingClient = new OpenAI({ apiKey: openAiApiKey });
      embeddingModel = await this.configProvider.get('OPENAI_EMBEDDING_MODEL') || 'text-embedding-3-small';
      providerName = 'openai';
    } else {
      embeddingModel = 'none';
      providerName = 'none';
    }

    return { jinaApiKey, embeddingClient, embeddingModel, providerName };
  }

  async getChatModelName(): Promise<string> {
    const { chatModel } = await this.getChatConfig();
    return chatModel;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const { chatClient, chatModel, provider } = await this.getChatConfig();
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const res = await chatClient.chat.completions.create({
        model: chatModel,
        messages,
        temperature: 0.1,
      });
      return res.choices[0]?.message?.content || '';
    } catch (err: any) {
      this.logger.error(`generateText failed [${provider}/${chatModel}]: ${err.message}`);
      throw err;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const { jinaApiKey, embeddingClient, embeddingModel } = await this.getEmbeddingConfig();

    if (jinaApiKey) {
      try {
        const res = await axios.post(
          'https://api.jina.ai/v1/embeddings',
          {
            model: embeddingModel,
            input: [text],
            dimensions: 1536,
          },
          {
            headers: {
              Authorization: `Bearer ${jinaApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );
        return res.data.data[0].embedding;
      } catch (err: any) {
        this.logger.error(`Jina embedding failed: ${err.message}`);
        throw err;
      }
    }

    if (embeddingClient) {
      const res = await embeddingClient.embeddings.create({
        model: embeddingModel,
        input: text,
        dimensions: 1536,
      });
      return res.data[0].embedding;
    }

    this.logger.warn('No embedding provider available — returning zero vector');
    return new Array(1536).fill(0);
  }

  async *streamText(
    prompt: string,
    systemPrompt?: string,
  ): AsyncGenerator<string> {
    const { chatClient, chatModel } = await this.getChatConfig();
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const stream = await chatClient.chat.completions.create({
      model: chatModel,
      messages,
      stream: true,
      temperature: 0.1,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) yield content;
    }
  }

  async healthCheck(): Promise<any> {
    const { chatModel, provider } = await this.getChatConfig();
    const { providerName: embeddingProvider, embeddingModel } = await this.getEmbeddingConfig();
    
    const result: any = {
      chatProvider: provider,
      chatModel,
      embeddingProvider,
      embeddingModel,
    };

    try {
      const t0 = Date.now();
      await this.generateText('Respond with the single word: OK');
      result.chatStatus = 'ok';
      result.chatLatencyMs = Date.now() - t0;
    } catch (e: any) {
      result.chatStatus = 'error';
      result.error = e.message;
    }

    if (embeddingModel === 'none') {
      result.embeddingStatus = 'degraded';
    } else {
      try {
        const t0 = Date.now();
        const vec = await this.generateEmbedding('test');
        result.embeddingStatus = vec.some(v => v !== 0) ? 'ok' : 'degraded';
        result.embeddingLatencyMs = Date.now() - t0;
      } catch (e: any) {
        result.embeddingStatus = 'error';
        result.error = e.message;
      }
    }

    return result;
  }
}
