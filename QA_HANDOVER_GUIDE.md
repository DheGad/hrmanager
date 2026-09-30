# HRManager4U.ai — Lead QA Validation & Verification Guide

**Target Audience:** Ameer Danial (Lead QA Engineer) & Independent QA Team  
**Evaluation Environments:**  
- **Live Production VPS:** [`http://66.42.62.57`](http://66.42.62.57)  
- **Local Docker Compose:** `http://localhost:3000` (Web) / `http://localhost:4000/api/v1` (API)  
**Authentication Bypass / Default Demo User:**  
- **Tenant:** `DemoCorp Global`
- **Email:** `admin@democorp.com`
- **Password:** `DemoCorp@2026`

---

## 1. QA Acceptance Matrix (25 Checkpoints)

Below is the structured QA test plan. Every test scenario corresponds to an essential enterprise requirement:

| ID | Module / Feature | Step-by-Step QA Procedure | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Landing Page** | Navigate to `/`. Inspect navigation, hero section, feature breakdown, and pricing tiers. | Smooth render, zero console errors, responsive layout. | UI matches enterprise aesthetic. |
| **TC-02** | **Negative Authentication** | Navigate to `/login`. Enter invalid email `fake.qa@democorp.com` with password `WrongPass!`. | System shows inline red alert `Invalid credentials`. Does NOT set session cookies or redirect. | HTTP 401 response; form remains intact. |
| **TC-03** | **Positive Authentication** | Enter `admin@democorp.com` / `DemoCorp@2026`. Click "Sign In". | System stores JWT access token in state, redirects to `/overview`. | Instant redirect; user avatar rendered in sidebar. |
| **TC-04** | **Protected Route Guard** | Clear browser cookies/storage and attempt to directly visit `/overview` or `/employees`. | Middleware intercepts unauthenticated request and immediately redirects back to `/login`. | Zero unauthorized data exposure. |
| **TC-05** | **Executive Morning Brief** | On `/overview`, review 4 StatCards (Total Employees, Active Leave, Compliance Health, Pending Approvals). | Numeric values match database counts. Zero "NaN" or "undefined" displays. | Live data loaded from `/api/v1/overview`. |
| **TC-06** | **9-Step Onboarding Wizard** | Navigate to `/onboarding`. Complete Step 1 (Company Details), click Next. Refresh page. | Wizard restores draft state from localStorage. Advancing to step 9 persists company setup. | Draft persistence verified; state unbroken. |
| **TC-07** | **Departments & Headcounts** | Navigate to `/departments`. Verify list of departments (Engineering, HR, Sales, Legal). | Cards show active employee count and department head. | `/api/v1/departments` returns 200 OK. |
| **TC-08** | **Employee Directory & Filter** | Navigate to `/employees`. Type search query (e.g., "Sarah"). Filter by "Active" status. | Table instantaneously filters rows to matching employee names. | Debounced search works; zero UI flicker. |
| **TC-09** | **Employee 360° Profile** | Click any employee row to open `/employees/[id]`. Inspect Personal, Compensation, and Timeline tabs. | Dossier loads with full profile. Timeline shows audit events (Onboarded, Promoted, Leave Approved). | Unalterable timeline accurately ordered. |
| **TC-10** | **Document Vault Grid** | Navigate to `/documents`. Inspect categorized tabs (Contracts, ID, Certifications). | Documents display title, category, upload date, and expiry traffic-light badge (Green/Yellow/Red). | High-risk expiring docs clearly flagged. |
| **TC-11** | **Document Upload Modal** | Click "Upload Document". Select PDF file, category "Contract", and expiry date. Submit. | Document appears in vault grid with instant status update. Audit event logged. | Document metadata saved to database. |
| **TC-12** | **Compliance Radar** | Navigate to `/compliance`. Check Compliance Score (e.g. 88%). View regional breakdown (Malaysia / Australia). | Breaches grouped by severity (Critical, Moderate, Low). | Regulatory statutory rules dynamically calculated. |
| **TC-13** | **Compliance Breach Resolution** | On `/compliance`, click "Resolve Breach" on an expired visa item. Review mitigation checklist. | Mitigation dialogue guides user through resolution workflow. | Status updates upon resolution. |
| **TC-14** | **Leave Balance Ledger** | Navigate to `/leave`. Review Annual, Sick, and Hospitalisation balances against statutory caps. | Balances accurately reflect tenure (e.g., 14 days annual leave for >2 years service). | Zero negative balance loopholes. |
| **TC-15** | **Leave Application & Overdraft Guard** | Click "Apply for Leave". Select dates exceeding current available quota. Submit. | Form rejects submission with error `Insufficient leave balance`. | Business logic bounds strictly enforced. |
| **TC-16** | **SLA Approval Workflows** | Navigate to `/workflows`. Inspect pending approval queue. Check SLA countdown timers. | Tasks display hours remaining before escalation. | Urgent items visually prioritized. |
| **TC-17** | **Workflow Action (Approve/Reject)** | Click "Approve" on a pending leave or expense item. | Item transitions to `APPROVED`. Submitter notified. Audit event recorded. | Real-time state transition. |
| **TC-18** | **AI Assistant Query** | Navigate to `/ai-assistant`. Ask: *"What is the statutory maternity leave entitlement under Malaysia Employment Act 1955?"* | AI returns 98 days maternity entitlement with specific section citation (Section 37). | Deterministic, verified legal response. |
| **TC-19** | **AI Human-in-the-Loop Gateway** | Ask AI: *"Generate a formal written warning for excessive absenteeism for John Doe."* | AI drafts warning letter and presents "Review & Confirm" modal. Action is NOT committed automatically. | Strict human approval requirement enforced. |
| **TC-20** | **Cryptographic Audit Ledger** | Navigate to `/audit`. Filter by recent actions. Inspect Actor, Action, Entity, and IP Address. | Chronological audit log displays all actions taken in TC-03 through TC-19. | Non-repudiation verified. |
| **TC-21** | **Workforce Analytics** | Navigate to `/analytics`. Inspect Recharts visualizations (Headcount Growth, Attrition, Gender Ratio). | Graphs render cleanly without clipping or console errors. | Interactive tooltips display precise metrics. |
| **TC-22** | **Tenant Control Center** | Navigate to `/control-center`. Inspect tenant settings, active modules, and API health status. | Health check indicators show `UP` for API, PostgreSQL, and Redis. | Multi-tenant isolation verified. |
| **TC-23** | **Notification Center** | Navigate to `/notifications`. Trigger action that creates notification. | Badge counter increments; notification item appears in tray with timestamp. | Event dispatcher functional. |
| **TC-24** | **Responsive Tablet Testing** | Resize viewport to 768x1024 (iPad). Inspect sidebar and tables. | Sidebar collapses to drawer icon; tables enable horizontal scroll or stacked view. | Clean UI without horizontal overflow. |
| **TC-25** | **Responsive Mobile Testing** | Resize viewport to 375x812 (iPhone). Test primary navigation and login. | Mobile burger menu operational; touch targets ≥ 44px; fonts fully legible. | Pass mobile usability guidelines. |

---

## 2. Automated Test Execution

You can run the complete Playwright E2E suite locally to verify all 25 test cases automatically:

```bash
# 1. Enter Web application directory
cd apps/web

# 2. Run Playwright End-to-End Suite
npx playwright test e2e/final_comprehensive_acceptance.js

# 3. View Generated HTML Test Report
npx playwright show-report
```

---

## 3. Reporting QA Defects

If you encounter any edge-case discrepancy, please report:
1. **Target URL / Route** (e.g. `/compliance`)
2. **User Role Tested** (`Super Admin`, `HR Manager`, `Employee`)
3. **Reproduction Steps**
4. **Expected vs Actual Behavior**
5. **Browser Console Output / Network Payload**
