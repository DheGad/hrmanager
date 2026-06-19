/**
 * HRManager4U.ai — E2E User Fixtures
 *
 * Credentials match the seeded test database.
 * Never use production credentials here.
 */

export interface UserCredentials {
  email: string;
  password: string;
  role: UserRole;
  tenantId: string;
  displayName: string;
  /** TOTP shared secret (base32) for MFA tests */
  totpSecret?: string;
  /** Pre-generated backup codes for MFA recovery tests */
  backupCodes?: string[];
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'HR_MANAGER'
  | 'EMPLOYEE'
  | 'AUDITOR'
  | 'RECRUITER';

// ─── Tenant A ──────────────────────────────────────────────────────────────────

export const HR_MANAGER: UserCredentials = {
  email: 'hr.manager@tenant-a.test',
  password: 'HrManager!2024$',
  role: 'HR_MANAGER',
  tenantId: 'tenant-a-uuid-0000-0000-000000000001',
  displayName: 'Alice Manager',
  totpSecret: 'JBSWY3DPEHPK3PXP',
  backupCodes: ['AAAA-BBBB', 'CCCC-DDDD', 'EEEE-FFFF'],
};

export const EMPLOYEE: UserCredentials = {
  email: 'employee@tenant-a.test',
  password: 'Employee!2024$',
  role: 'EMPLOYEE',
  tenantId: 'tenant-a-uuid-0000-0000-000000000001',
  displayName: 'Bob Employee',
};

export const AUDITOR: UserCredentials = {
  email: 'auditor@tenant-a.test',
  password: 'Auditor!2024$',
  role: 'AUDITOR',
  tenantId: 'tenant-a-uuid-0000-0000-000000000001',
  displayName: 'Carol Auditor',
};

// ─── Tenant B (cross-tenant isolation tests) ──────────────────────────────────

export const TENANT_B_HR: UserCredentials = {
  email: 'hr.manager@tenant-b.test',
  password: 'HrManager!2024$',
  role: 'HR_MANAGER',
  tenantId: 'tenant-b-uuid-0000-0000-000000000002',
  displayName: 'Dave HR (Tenant B)',
};

// ─── Global ───────────────────────────────────────────────────────────────────

export const SUPER_ADMIN: UserCredentials = {
  email: 'superadmin@hrmanager4u.test',
  password: 'SuperAdmin!2024$',
  role: 'SUPER_ADMIN',
  tenantId: 'global',
  displayName: 'Eve SuperAdmin',
};

// ─── Invalid / boundary fixtures ──────────────────────────────────────────────

export const INVALID_USER = {
  email: 'nonexistent@tenant-a.test',
  password: 'WrongPassword123!',
};

export const WRONG_PASSWORD = {
  email: HR_MANAGER.email,
  password: 'WrongPassword999!',
};
