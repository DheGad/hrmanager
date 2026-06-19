// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Evaluates the tenant's compliance against mandatory HR policies.
   */
  async calculateScore(tenantId: string, companyId: string, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Company not found');

    const country = company.country; // e.g., 'MY' or 'AU'
    
    // Define mandatory policies by country
    const mandatoryPolicies: Record<string, string[]> = {
      MY: ['EMPLOYEE_HANDBOOK', 'CODE_OF_CONDUCT', 'DATA_PROTECTION_POLICY', 'SEXUAL_HARASSMENT_POLICY'],
      AU: ['EMPLOYEE_HANDBOOK', 'CODE_OF_CONDUCT', 'WHS_POLICY', 'FAIR_WORK_INFORMATION_STATEMENT'],
      SG: ['EMPLOYEE_HANDBOOK', 'CODE_OF_CONDUCT', 'PDPA_POLICY']
    };

    const required = mandatoryPolicies[country] || mandatoryPolicies['MY'];
    
    // Fetch active handbook policies
    const activeHandbooks = await this.prisma.handbookPolicy.findMany({
      where: { tenantId, companyId, status: 'FINALIZED' }
    });

    const activePolicyNames = new Set(activeHandbooks.map(h => h.name.toUpperCase().replace(/ /g, '_')));
    
    const missingPolicies = required.filter(p => !activePolicyNames.has(p));
    
    // Calculate Score (Simple logic: 100 - 25 per missing policy)
    const penalty = missingPolicies.length * 25;
    const rawScore = 100 - penalty;
    const score = Math.max(0, rawScore);

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score < 50) riskLevel = 'CRITICAL';
    else if (score < 75) riskLevel = 'HIGH';
    else if (score < 100) riskLevel = 'MEDIUM';

    const checklist = required.map(policy => ({
      item: policy,
      category: 'POLICY_DOCUMENT',
      status: activePolicyNames.has(policy) ? 'PASS' : 'FAIL',
      evidence: activePolicyNames.has(policy) ? 'Found in HandbookPolicy' : 'Missing'
    }));

    const record = await this.prisma.complianceRecord.create({
      data: {
        tenantId,
        companyId,
        score,
        riskLevel,
        checklist,
        missingPolicies,
        assessedAt: new Date(),
        createdBy: userId
      }
    });

    this.auditService.log({
      action: 'COMPLIANCE_AUDIT_RUN',
      resource: 'ComplianceRecord',
      resourceId: record.id,
      tenantId,
      userId,
      description: `Compliance audit executed. Score: \${score}, Risk: \${riskLevel}`
    });

    return record;
  }

  async getLatestScore(tenantId: string, companyId: string) {
    const record = await this.prisma.complianceRecord.findFirst({
      where: { tenantId, companyId },
      orderBy: { assessedAt: 'desc' }
    });
    return record || { score: 0, riskLevel: 'UNKNOWN', missingPolicies: [] };
  }

  async analyze(tenantId: string, country: string, documents: any[]) {
    // Null-safe: handle missing documents array
    const docs = Array.isArray(documents) ? documents : [];
    const countryCode = (country || 'MY').toUpperCase();

    // Same mandatory policy list as calculateScore for consistency
    const mandatoryPolicies: Record<string, string[]> = {
      MY: ['EMPLOYEE_HANDBOOK', 'CODE_OF_CONDUCT', 'DATA_PROTECTION_POLICY', 'SEXUAL_HARASSMENT_POLICY'],
      AU: ['EMPLOYEE_HANDBOOK', 'CODE_OF_CONDUCT', 'WHS_POLICY', 'FAIR_WORK_INFORMATION_STATEMENT'],
      SG: ['EMPLOYEE_HANDBOOK', 'CODE_OF_CONDUCT', 'PDPA_POLICY'],
    };
    const mandatory = mandatoryPolicies[countryCode] || mandatoryPolicies['MY'];
    const docTypes = new Set(docs.map(d => (d.type || d.name || '').toUpperCase().replace(/[\s-]+/g, '_')));

    const missingPolicies = mandatory.filter(m => !docTypes.has(m));
    // Consistent penalty: 25 per missing policy (same as calculateScore)
    const score = Math.max(0, 100 - missingPolicies.length * 25);

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score < 50) riskLevel = 'CRITICAL';
    else if (score < 75) riskLevel = 'HIGH';
    else if (score < 100) riskLevel = 'MEDIUM';

    return {
      riskScore: score,
      riskLevel,
      missingPolicies,
      checklist: mandatory.map(p => ({
        item: p,
        status: docTypes.has(p) ? 'PASS' : 'FAIL',
      })),
      recommendations: missingPolicies.map(p => `Please generate and publish a ${p.replace(/_/g, ' ')}.`),
    };
  }
}
