
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  plan: 'plan',
  country: 'country',
  isActive: 'isActive',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  email: 'email',
  passwordHash: 'passwordHash',
  role: 'role',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  isActive: 'isActive',
  mfaEnabled: 'mfaEnabled',
  mfaSecret: 'mfaSecret',
  emailVerified: 'emailVerified',
  lastLoginAt: 'lastLoginAt',
  passwordResetToken: 'passwordResetToken',
  passwordResetExpiry: 'passwordResetExpiry',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tenantId: 'tenantId',
  refreshToken: 'refreshToken',
  deviceInfo: 'deviceInfo',
  ipAddress: 'ipAddress',
  expiresAt: 'expiresAt',
  revokedAt: 'revokedAt',
  createdAt: 'createdAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  role: 'role',
  resource: 'resource',
  action: 'action'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  legalName: 'legalName',
  regNumber: 'regNumber',
  taxNumber: 'taxNumber',
  industry: 'industry',
  size: 'size',
  country: 'country',
  address: 'address',
  city: 'city',
  state: 'state',
  postcode: 'postcode',
  phone: 'phone',
  email: 'email',
  website: 'website',
  logoUrl: 'logoUrl',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BranchScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  companyId: 'companyId',
  name: 'name',
  address: 'address',
  city: 'city',
  state: 'state',
  postcode: 'postcode',
  isHeadquarters: 'isHeadquarters',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  companyId: 'companyId',
  name: 'name',
  code: 'code',
  parentDepartmentId: 'parentDepartmentId',
  managerId: 'managerId',
  budget: 'budget',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  departmentId: 'departmentId',
  name: 'name',
  managerId: 'managerId',
  budget: 'budget',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  companyId: 'companyId',
  userId: 'userId',
  employeeNumber: 'employeeNumber',
  firstName: 'firstName',
  lastName: 'lastName',
  preferredName: 'preferredName',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  nationality: 'nationality',
  nricPassport: 'nricPassport',
  visaDetails: 'visaDetails',
  personalEmail: 'personalEmail',
  workEmail: 'workEmail',
  phone: 'phone',
  mobile: 'mobile',
  address: 'address',
  city: 'city',
  state: 'state',
  postcode: 'postcode',
  country: 'country',
  departmentId: 'departmentId',
  teamId: 'teamId',
  branchId: 'branchId',
  managerId: 'managerId',
  jobTitle: 'jobTitle',
  jobLevel: 'jobLevel',
  salaryBand: 'salaryBand',
  employmentType: 'employmentType',
  employmentStatus: 'employmentStatus',
  hireDate: 'hireDate',
  confirmationDate: 'confirmationDate',
  terminationDate: 'terminationDate',
  probationEndDate: 'probationEndDate',
  noticePeriodDays: 'noticePeriodDays',
  baseSalary: 'baseSalary',
  bankName: 'bankName',
  bankAccount: 'bankAccount',
  bankCode: 'bankCode',
  emergencyContactName: 'emergencyContactName',
  emergencyContactPhone: 'emergencyContactPhone',
  emergencyContactRelation: 'emergencyContactRelation',
  avatarUrl: 'avatarUrl',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContractScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  employeeId: 'employeeId',
  companyId: 'companyId',
  contractType: 'contractType',
  startDate: 'startDate',
  endDate: 'endDate',
  position: 'position',
  department: 'department',
  salary: 'salary',
  currency: 'currency',
  workingHoursPerWeek: 'workingHoursPerWeek',
  status: 'status',
  documentUrl: 'documentUrl',
  notes: 'notes',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  companyId: 'companyId',
  employeeId: 'employeeId',
  type: 'type',
  title: 'title',
  description: 'description',
  status: 'status',
  templateData: 'templateData',
  pdfUrl: 'pdfUrl',
  docxUrl: 'docxUrl',
  fileSize: 'fileSize',
  generatedAt: 'generatedAt',
  sentAt: 'sentAt',
  acknowledgedAt: 'acknowledgedAt',
  expiresAt: 'expiresAt',
  generatedBy: 'generatedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KnowledgeBaseScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  description: 'description',
  type: 'type',
  country: 'country',
  jurisdiction: 'jurisdiction',
  isSystemDocument: 'isSystemDocument',
  status: 'status',
  fileUrl: 'fileUrl',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  pageCount: 'pageCount',
  chunkCount: 'chunkCount',
  errorMessage: 'errorMessage',
  processedAt: 'processedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentChunkScalarFieldEnum = {
  id: 'id',
  knowledgeBaseId: 'knowledgeBaseId',
  tenantId: 'tenantId',
  chunkIndex: 'chunkIndex',
  content: 'content',
  contentTokens: 'contentTokens',
  pageNumber: 'pageNumber',
  sectionTitle: 'sectionTitle',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.AiConversationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  title: 'title',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AiMessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  tenantId: 'tenantId',
  userId: 'userId',
  role: 'role',
  content: 'content',
  citations: 'citations',
  sourcesUsed: 'sourcesUsed',
  promptTokens: 'promptTokens',
  completionTokens: 'completionTokens',
  modelUsed: 'modelUsed',
  processingMs: 'processingMs',
  createdAt: 'createdAt'
};

exports.Prisma.HandbookPolicyScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  companyId: 'companyId',
  name: 'name',
  version: 'version',
  country: 'country',
  policies: 'policies',
  status: 'status',
  handbookUrl: 'handbookUrl',
  codeOfConductUrl: 'codeOfConductUrl',
  publishedAt: 'publishedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ComplianceRecordScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  companyId: 'companyId',
  score: 'score',
  riskLevel: 'riskLevel',
  checklist: 'checklist',
  missingPolicies: 'missingPolicies',
  reportUrl: 'reportUrl',
  notes: 'notes',
  assessedAt: 'assessedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  userEmail: 'userEmail',
  userRole: 'userRole',
  action: 'action',
  resource: 'resource',
  resourceId: 'resourceId',
  description: 'description',
  metadata: 'metadata',
  aiPrompt: 'aiPrompt',
  aiResponse: 'aiResponse',
  aiSourceDocuments: 'aiSourceDocuments',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  httpMethod: 'httpMethod',
  httpPath: 'httpPath',
  httpStatus: 'httpStatus',
  durationMs: 'durationMs',
  severity: 'severity',
  timestamp: 'timestamp'
};

exports.Prisma.LeaveTypeScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  description: 'description',
  isPaid: 'isPaid',
  defaultDays: 'defaultDays',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveBalanceScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  employeeId: 'employeeId',
  leaveTypeId: 'leaveTypeId',
  year: 'year',
  totalDays: 'totalDays',
  takenDays: 'takenDays',
  pendingDays: 'pendingDays'
};

exports.Prisma.LeaveRequestScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  employeeId: 'employeeId',
  leaveTypeId: 'leaveTypeId',
  startDate: 'startDate',
  endDate: 'endDate',
  days: 'days',
  reason: 'reason',
  status: 'status',
  managerId: 'managerId',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeFileScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  employeeId: 'employeeId',
  category: 'category',
  title: 'title',
  fileUrl: 'fileUrl',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  expiryDate: 'expiryDate',
  isEncrypted: 'isEncrypted',
  uploadedBy: 'uploadedBy',
  createdAt: 'createdAt'
};

exports.Prisma.DocumentTemplateScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  type: 'type',
  name: 'name',
  description: 'description',
  content: 'content',
  variables: 'variables',
  version: 'version',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkflowTemplateScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  type: 'type',
  name: 'name',
  steps: 'steps',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkflowInstanceScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  templateId: 'templateId',
  status: 'status',
  currentLevel: 'currentLevel',
  targetResource: 'targetResource',
  targetId: 'targetId',
  requesterId: 'requesterId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkflowStepLogScalarFieldEnum = {
  id: 'id',
  instanceId: 'instanceId',
  level: 'level',
  status: 'status',
  approverId: 'approverId',
  comments: 'comments',
  actionAt: 'actionAt'
};

exports.Prisma.NotificationTemplateScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  type: 'type',
  channel: 'channel',
  content: 'content',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  channel: 'channel',
  type: 'type',
  status: 'status',
  error: 'error',
  sentAt: 'sentAt',
  createdAt: 'createdAt'
};

exports.Prisma.LifecycleEventScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  employeeId: 'employeeId',
  previousStatus: 'previousStatus',
  newStatus: 'newStatus',
  effectiveDate: 'effectiveDate',
  reason: 'reason',
  changedBy: 'changedBy',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Plan = exports.$Enums.Plan = {
  TRIAL: 'TRIAL',
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE'
};

exports.Country = exports.$Enums.Country = {
  MY: 'MY',
  AU: 'AU',
  SG: 'SG'
};

exports.Role = exports.$Enums.Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  AUDITOR: 'AUDITOR'
};

exports.CompanySize = exports.$Enums.CompanySize = {
  MICRO: 'MICRO',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
};

exports.Gender = exports.$Enums.Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  NON_BINARY: 'NON_BINARY',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY'
};

exports.EmploymentType = exports.$Enums.EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN',
  TEMPORARY: 'TEMPORARY'
};

exports.EmploymentStatus = exports.$Enums.EmploymentStatus = {
  CANDIDATE: 'CANDIDATE',
  ACTIVE: 'ACTIVE',
  PROBATION: 'PROBATION',
  NOTICE_PERIOD: 'NOTICE_PERIOD',
  RESIGNED: 'RESIGNED',
  TERMINATED: 'TERMINATED',
  RETIRED: 'RETIRED',
  ALUMNI: 'ALUMNI'
};

exports.ContractType = exports.$Enums.ContractType = {
  PERMANENT: 'PERMANENT',
  FIXED_TERM: 'FIXED_TERM',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP'
};

exports.ContractStatus = exports.$Enums.ContractStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED'
};

exports.DocumentType = exports.$Enums.DocumentType = {
  EMPLOYMENT_CONTRACT: 'EMPLOYMENT_CONTRACT',
  OFFER_LETTER: 'OFFER_LETTER',
  WARNING_LETTER: 'WARNING_LETTER',
  SHOW_CAUSE_LETTER: 'SHOW_CAUSE_LETTER',
  TERMINATION_LETTER: 'TERMINATION_LETTER',
  PROMOTION_LETTER: 'PROMOTION_LETTER',
  CONFIRMATION_LETTER: 'CONFIRMATION_LETTER',
  RESIGNATION_ACCEPTANCE_LETTER: 'RESIGNATION_ACCEPTANCE_LETTER',
  EXPERIENCE_LETTER: 'EXPERIENCE_LETTER',
  INTERNSHIP_LETTER: 'INTERNSHIP_LETTER',
  LEAVE_FORM: 'LEAVE_FORM',
  EMPLOYEE_HANDBOOK: 'EMPLOYEE_HANDBOOK',
  CODE_OF_CONDUCT: 'CODE_OF_CONDUCT',
  CUSTOM: 'CUSTOM'
};

exports.DocumentStatus = exports.$Enums.DocumentStatus = {
  DRAFT: 'DRAFT',
  GENERATED: 'GENERATED',
  SENT: 'SENT',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  ARCHIVED: 'ARCHIVED'
};

exports.KnowledgeBaseType = exports.$Enums.KnowledgeBaseType = {
  EMPLOYMENT_ACT: 'EMPLOYMENT_ACT',
  INDUSTRIAL_RELATIONS_ACT: 'INDUSTRIAL_RELATIONS_ACT',
  COMPANY_HANDBOOK: 'COMPANY_HANDBOOK',
  CODE_OF_CONDUCT: 'CODE_OF_CONDUCT',
  CUSTOM: 'CUSTOM'
};

exports.KnowledgeBaseStatus = exports.$Enums.KnowledgeBaseStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  ERROR: 'ERROR'
};

exports.MessageRole = exports.$Enums.MessageRole = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
  SYSTEM: 'SYSTEM'
};

exports.HandbookStatus = exports.$Enums.HandbookStatus = {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED',
  ARCHIVED: 'ARCHIVED'
};

exports.RiskLevel = exports.$Enums.RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.AuditSeverity = exports.$Enums.AuditSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

exports.LeaveRequestStatus = exports.$Enums.LeaveRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

exports.FileCategory = exports.$Enums.FileCategory = {
  PASSPORT: 'PASSPORT',
  VISA: 'VISA',
  CONTRACT: 'CONTRACT',
  CERTIFICATE: 'CERTIFICATE',
  LEAVE_RECORD: 'LEAVE_RECORD',
  PERFORMANCE_RECORD: 'PERFORMANCE_RECORD',
  DISCIPLINARY_RECORD: 'DISCIPLINARY_RECORD',
  OTHER: 'OTHER'
};

exports.WorkflowType = exports.$Enums.WorkflowType = {
  LEAVE: 'LEAVE',
  PROMOTION: 'PROMOTION',
  DOCUMENT: 'DOCUMENT',
  EXPENSE: 'EXPENSE',
  RECRUITMENT: 'RECRUITMENT',
  CUSTOM: 'CUSTOM'
};

exports.WorkflowStatus = exports.$Enums.WorkflowStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ESCALATED: 'ESCALATED',
  CANCELLED: 'CANCELLED'
};

exports.NotificationChannel = exports.$Enums.NotificationChannel = {
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  SMS: 'SMS',
  IN_APP: 'IN_APP'
};

exports.NotificationStatus = exports.$Enums.NotificationStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED'
};

exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  User: 'User',
  Session: 'Session',
  Permission: 'Permission',
  Company: 'Company',
  Branch: 'Branch',
  Department: 'Department',
  Team: 'Team',
  Employee: 'Employee',
  Contract: 'Contract',
  Document: 'Document',
  KnowledgeBase: 'KnowledgeBase',
  DocumentChunk: 'DocumentChunk',
  AiConversation: 'AiConversation',
  AiMessage: 'AiMessage',
  HandbookPolicy: 'HandbookPolicy',
  ComplianceRecord: 'ComplianceRecord',
  AuditLog: 'AuditLog',
  LeaveType: 'LeaveType',
  LeaveBalance: 'LeaveBalance',
  LeaveRequest: 'LeaveRequest',
  EmployeeFile: 'EmployeeFile',
  DocumentTemplate: 'DocumentTemplate',
  WorkflowTemplate: 'WorkflowTemplate',
  WorkflowInstance: 'WorkflowInstance',
  WorkflowStepLog: 'WorkflowStepLog',
  NotificationTemplate: 'NotificationTemplate',
  NotificationLog: 'NotificationLog',
  LifecycleEvent: 'LifecycleEvent'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
