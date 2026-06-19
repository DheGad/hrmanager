import { Injectable, Logger } from '@nestjs/common';
import { ConfigProviderService } from '../../shared/config-provider/config-provider.service';
import { PrismaService } from '../../database/prisma.service';
import { LlmService } from '../../shared/llm/llm.service';

@Injectable()
export class ControlCenterService {
  private readonly logger = new Logger(ControlCenterService.name);

  constructor(
    private readonly configProvider: ConfigProviderService,
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
  ) {}

  async getConfig(tenantId: string | null = null) {
    // Only return non-secret fields fully. Mask secrets.
    return {
      ai: {
        provider: await this.configProvider.get('AI_PROVIDER', tenantId),
        chatModel: await this.configProvider.get('AI_CHAT_MODEL', tenantId),
        openRouterKey: this.maskSecret(await this.configProvider.get('OPENROUTER_API_KEY', tenantId)),
        openAiKey: this.maskSecret(await this.configProvider.get('OPENAI_API_KEY', tenantId)),
        azureKey: this.maskSecret(await this.configProvider.get('AZURE_OPENAI_API_KEY', tenantId)),
        azureEndpoint: await this.configProvider.get('AZURE_OPENAI_ENDPOINT', tenantId),
        azureDeployment: await this.configProvider.get('AZURE_OPENAI_DEPLOYMENT', tenantId),
        jinaKey: this.maskSecret(await this.configProvider.get('AI_JINA_API_KEY', tenantId)),
      },
      email: {
        host: await this.configProvider.get('SMTP_HOST', tenantId),
        port: await this.configProvider.get('SMTP_PORT', tenantId),
        user: await this.configProvider.get('SMTP_USER', tenantId),
        pass: this.maskSecret(await this.configProvider.get('SMTP_PASS', tenantId)),
        fromName: await this.configProvider.get('SMTP_FROM_NAME', tenantId),
        fromEmail: await this.configProvider.get('SMTP_FROM_EMAIL', tenantId),
        secure: await this.configProvider.get('SMTP_SECURE', tenantId),
      },
      storage: {
        endpoint: await this.configProvider.get('STORAGE_ENDPOINT', tenantId),
        port: await this.configProvider.get('STORAGE_PORT', tenantId),
        useSsl: await this.configProvider.get('STORAGE_USE_SSL', tenantId),
        accessKey: this.maskSecret(await this.configProvider.get('STORAGE_ACCESS_KEY', tenantId)),
        secretKey: this.maskSecret(await this.configProvider.get('STORAGE_SECRET_KEY', tenantId)),
        bucket: await this.configProvider.get('STORAGE_BUCKET', tenantId),
      },
      company: {
        name: await this.configProvider.get('COMPANY_NAME', tenantId),
        timezone: await this.configProvider.get('COMPANY_TIMEZONE', tenantId),
        currency: await this.configProvider.get('COMPANY_CURRENCY', tenantId),
      }
    };
  }

  async updateConfig(category: string, config: Record<string, string>, tenantId: string | null = null, updatedBy?: string) {
    for (const [key, value] of Object.entries(config)) {
      if (!value) continue;
      // If it's a masked secret, do NOT save it. It means the user didn't update it.
      if (value.startsWith('****')) continue;

      const isSecret = key.includes('KEY') || key.includes('PASS');
      await this.configProvider.setSecure(key, value, category, isSecret, tenantId, updatedBy);
    }
  }

  async testAiConnection() {
    return this.llmService.healthCheck();
  }

  async getHealth() {
    let dbStatus = 'error';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'ok';
    } catch (e) {}

    const aiHealth = await this.llmService.healthCheck();

    return {
      database: dbStatus,
      ai: aiHealth,
    };
  }

  async getCosts() {
    // Basic estimation
    const auditLogs = await this.prisma.auditLog.count({
      where: { action: 'AI_QUERY' }
    });
    
    // Assume average 2k tokens per query, $0.075 per 1M tokens for Flash
    const aiCostEstimate = (auditLogs * 2000 / 1000000) * 0.075;

    // Sum storage sizes
    const storageResult = await this.prisma.employeeFile.aggregate({
      _sum: { fileSize: true }
    });
    const totalBytes = storageResult._sum.fileSize || 0;
    const totalGb = totalBytes / (1024 * 1024 * 1024);
    const storageCostEstimate = totalGb * 0.02; // AWS S3 pricing approx

    return {
      totalAiQueries: auditLogs,
      aiCostEstimateUsd: aiCostEstimate.toFixed(4),
      storageGb: totalGb.toFixed(2),
      storageCostEstimateUsd: storageCostEstimate.toFixed(4),
      totalEstimateUsd: (aiCostEstimate + storageCostEstimate).toFixed(4),
    };
  }

  private maskSecret(secret?: string): string {
    if (!secret) return '';
    if (secret.length <= 4) return '****';
    return `****${secret.slice(-4)}`;
  }
}
