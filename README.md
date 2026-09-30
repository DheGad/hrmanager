# HRManager4U.ai — Next-Gen AI-Powered Human Resource Management & Global Compliance Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-ea2845.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2015%20%7C%20Prisma-blue.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Cache%20%26%20Queue-Redis%207-red.svg)](https://redis.io/)
[![Compliance](https://img.shields.io/badge/Compliance-MY%20Employment%20Act%201955%20%7C%20AU%20Fair%20Work-blueviolet.svg)](#statutory-compliance-engine)

---

## 1. Executive Overview

**HRManager4U.ai** is an enterprise-grade, multi-tenant Human Resource Management Platform equipped with an **AI Action Gateway**, **Statutory Compliance Radar**, and **Cryptographic Audit Ledger**. 

Designed for global enterprises and multi-jurisdictional companies (with native compliance engines for Malaysia Employment Act 1955, PDPA 2010, and Australia Fair Work Act 2009), the platform unifies headcount tracking, 9-step customer onboarding, unalterable employee 360° dossiers, digital vault intelligence, statutory leave quotas, and SLA-driven approval workflows.

### 🌐 Live Production Target
- **Live Production URL:** [`http://66.42.62.57`](http://66.42.62.57)
- **Primary Demo Tenant:** `DemoCorp Global (democorp)`
- **Demo Credentials:**
  - **Email:** `admin@democorp.com`
  - **Password:** `DemoCorp@2026`
- **Fallback Super Admin:**
  - **Email:** `admin@hrmanager4u.ai`
  - **Password:** `Password123!`

---

## 2. Monorepo Architecture

The platform is architected as an industrial Turborepo monorepo:

```text
hrmanager4u/
├── apps/
│   ├── api/                     # NestJS 10 REST API
│   │   ├── prisma/              # Prisma schema & database seeds
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/         # JWT (15m access, 7d refresh) + Multi-tenant guards
│   │       │   ├── employee/     # Full employee lifecycle & status transitions
│   │       │   ├── onboarding/   # 9-step wizard state & validation
│   │       │   ├── compliance/   # Statutory Radar (MY 1955 / AU Fair Work)
│   │       │   ├── leave/        # Statutory leave balances & approval logic
│   │       │   ├── vault/        # Document Intelligence & metadata parsing
│   │       │   ├── ai-assistant/ # Human-in-the-loop AI intent gateway & citations
│   │       │   ├── audit/        # Non-repudiation event ledger
│   │       │   └── control-center/# Tenant config, AI model selection, health
│   │       └── shared/          # Redis caching, Pino logging, LLM service
│   └── web/                     # Next.js 14 (App Router) + Tailwind CSS + Lucide
│       ├── src/
│       │   ├── app/(dashboard)/ # Overview, Employees, Onboarding, Vault, Compliance, Workflows, Audit
│       │   └── components/      # Glassmorphic UI components, StatCards, DataTables
├── docker-compose.yml           # Local full-stack runtime (PostgreSQL, Redis, API, Web)
├── docker-compose.saas.yml      # Production multi-tenant container stack
└── QA_HANDOVER_GUIDE.md         # Step-by-step test matrix for Lead QA Engineers
```

---

## 3. Core Functional Capabilities

### 🏢 1. Command Center & Morning Brief (`/overview`)
- Real-time headcount statistics (Active, Probation, On Leave, Departed).
- High-priority statutory alerts requiring immediate HR intervention.
- Quick action triggers for employee onboarding and document creation.

### 🧙‍♂️ 2. Customer Onboarding Wizard (`/onboarding`)
- 9-step guided wizard (Company Profile, Legal Entities, Departments, Statutory Registration, Leave Policies, Work Hours, Super Admins, Integrations, Review & Sign).
- Local storage draft auto-recovery paired with server-side database persistence.

### 👥 3. Employee Directory & 360° Profile (`/employees`, `/employees/[id]`)
- Multi-filter directory (Department, Status, Branch, Employment Type).
- 360° Employee Dossier: Personal, Compensation, Emergency, Documents, and an **Immutable Timeline** querying database audit trails directly.

### 📁 4. Document Intelligence Vault (`/documents`)
- Multi-category secure storage (Contracts, ID Documents, Certifications, Medical).
- Expiry date tracking with automated traffic-light visual indicators (Current, Expiring Soon, Expired).

### ⚖️ 5. Statutory Compliance Radar (`/compliance`)
- Real-time multi-jurisdiction risk scoring:
  - **Malaysia:** Employment Act 1955, EPF Act, SOCSO, EIS, HRDF, PDPA 2010.
  - **Australia:** Fair Work Act 2009, Modern Awards, Superannuation Guarantee, WHS Act.
- Actionable compliance breach resolution modal with statutory mitigation playbooks.

### 🏖️ 6. Leave Ledger & Quotas (`/leave`)
- Automated statutory quota calculations based on tenure (Annual, Sick, Hospitalisation, Maternity, Paternity).
- Leave request validation with quota boundary enforcement and manager escalation.

### ⚡ 7. SLA Approval Workflows (`/workflows`)
- Multi-tier approval routing for Leave, Expense, and Onboarding approvals.
- SLA countdown timers and visual escalation badges.

### 🤖 8. AI Action Gateway (`/ai-assistant`)
- Human-in-the-Loop (HITL) architectural paradigm: AI suggests structured actions (e.g., generate warning letter, update leave allowance), but execution strictly pauses for human review and confirmation.
- Direct legal citations to national employment acts.

### 📜 9. Cryptographic Audit Ledger (`/audit`)
- Immutable event capture across all entity mutations, logins, and approvals.
- IP address, User-Agent, before/after snapshot differentials for ASQA/audit readiness.

---

## 4. Local Development & Testing

### Prerequisites
- Node.js ≥ 20.0.0
- pnpm ≥ 9.0.0
- Docker & Docker Compose

### Quickstart (Local)

```bash
# 1. Clone the repository
git clone https://github.com/DheGad/hrmanager.git
cd hrmanager

# 2. Install dependencies
pnpm install

# 3. Spin up PostgreSQL and Redis
docker compose up -d hrmanager4u-db hrmanager4u-redis

# 4. Generate Prisma Client & Run Database Migrations
cd apps/api
pnpm prisma migrate deploy
pnpm prisma db seed

# 5. Start Backend & Frontend in Development Mode
cd ../..
pnpm dev
```

### Running Automated QA Tests

```bash
# Run API Unit & Integration Tests
cd apps/api
pnpm test

# Run End-to-End Acceptance Tests (Playwright)
cd ../web
npx playwright test
```

---

## 5. QA Validation Guide for Lead QA (Ameer Danial)

Please review [`QA_HANDOVER_GUIDE.md`](./QA_HANDOVER_GUIDE.md) for the complete 25-point QA test matrix, step-by-step verification procedures, positive/negative test cases, and live proof points.
