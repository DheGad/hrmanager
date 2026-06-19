import { Test, TestingModule } from '@nestjs/testing';
import { HandbookService } from './handbook.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';

describe('HandbookService', () => {
  let service: HandbookService;
  let prismaService: any;
  let auditService: any;

  beforeEach(async () => {
    prismaService = {
      handbookPolicy: {
        create: jest.fn().mockResolvedValue({ id: '123' }),
        update: jest.fn().mockResolvedValue({ id: '123' }),
      },
    };

    auditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandbookService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuditService, useValue: auditService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<HandbookService>(HandbookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWizardDefaults', () => {
    it('should return AU defaults when AU is passed', async () => {
      const defaults = await service.getWizardDefaults('AU');
      expect(defaults.annualLeaveWeeks).toEqual(4);
    });

    it('should return MY defaults when anything else is passed', async () => {
      const defaults = await service.getWizardDefaults('MY');
      expect(defaults.annualLeaveDays).toEqual(8);
    });
  });
});
