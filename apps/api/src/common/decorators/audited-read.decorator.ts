import { SetMetadata } from '@nestjs/common';

export const AUDITED_READ_KEY = 'audited_read';
export const AuditedRead = (reason: string) => SetMetadata(AUDITED_READ_KEY, reason);
