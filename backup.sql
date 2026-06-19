--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-2.pgdg120+1)
-- Dumped by pg_dump version 15.4 (Debian 15.4-2.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: audit_severity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.audit_severity AS ENUM (
    'INFO',
    'WARNING',
    'ERROR',
    'CRITICAL'
);


ALTER TYPE public.audit_severity OWNER TO postgres;

--
-- Name: company_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.company_size AS ENUM (
    'MICRO',
    'SMALL',
    'MEDIUM',
    'LARGE'
);


ALTER TYPE public.company_size OWNER TO postgres;

--
-- Name: contract_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.contract_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'EXPIRED',
    'TERMINATED'
);


ALTER TYPE public.contract_status OWNER TO postgres;

--
-- Name: contract_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.contract_type AS ENUM (
    'PERMANENT',
    'FIXED_TERM',
    'CONTRACT',
    'INTERNSHIP'
);


ALTER TYPE public.contract_type OWNER TO postgres;

--
-- Name: country; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.country AS ENUM (
    'MY',
    'AU',
    'SG'
);


ALTER TYPE public.country OWNER TO postgres;

--
-- Name: document_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_status AS ENUM (
    'DRAFT',
    'GENERATED',
    'SENT',
    'ACKNOWLEDGED',
    'ARCHIVED'
);


ALTER TYPE public.document_status OWNER TO postgres;

--
-- Name: document_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_type AS ENUM (
    'EMPLOYMENT_CONTRACT',
    'OFFER_LETTER',
    'WARNING_LETTER',
    'SHOW_CAUSE_LETTER',
    'TERMINATION_LETTER',
    'PROMOTION_LETTER',
    'CONFIRMATION_LETTER',
    'RESIGNATION_ACCEPTANCE_LETTER',
    'EXPERIENCE_LETTER',
    'INTERNSHIP_LETTER',
    'LEAVE_FORM',
    'EMPLOYEE_HANDBOOK',
    'CODE_OF_CONDUCT',
    'CUSTOM'
);


ALTER TYPE public.document_type OWNER TO postgres;

--
-- Name: employment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employment_status AS ENUM (
    'CANDIDATE',
    'ACTIVE',
    'PROBATION',
    'NOTICE_PERIOD',
    'RESIGNED',
    'TERMINATED',
    'RETIRED',
    'ALUMNI'
);


ALTER TYPE public.employment_status OWNER TO postgres;

--
-- Name: employment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employment_type AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERN',
    'TEMPORARY'
);


ALTER TYPE public.employment_type OWNER TO postgres;

--
-- Name: file_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.file_category AS ENUM (
    'PASSPORT',
    'VISA',
    'CONTRACT',
    'CERTIFICATE',
    'LEAVE_RECORD',
    'PERFORMANCE_RECORD',
    'DISCIPLINARY_RECORD',
    'OTHER'
);


ALTER TYPE public.file_category OWNER TO postgres;

--
-- Name: gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender AS ENUM (
    'MALE',
    'FEMALE',
    'NON_BINARY',
    'PREFER_NOT_TO_SAY'
);


ALTER TYPE public.gender OWNER TO postgres;

--
-- Name: handbook_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.handbook_status AS ENUM (
    'DRAFT',
    'FINALIZED',
    'ARCHIVED'
);


ALTER TYPE public.handbook_status OWNER TO postgres;

--
-- Name: knowledge_base_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.knowledge_base_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'READY',
    'ERROR'
);


ALTER TYPE public.knowledge_base_status OWNER TO postgres;

--
-- Name: knowledge_base_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.knowledge_base_type AS ENUM (
    'EMPLOYMENT_ACT',
    'INDUSTRIAL_RELATIONS_ACT',
    'COMPANY_HANDBOOK',
    'CODE_OF_CONDUCT',
    'CUSTOM'
);


ALTER TYPE public.knowledge_base_type OWNER TO postgres;

--
-- Name: leave_request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.leave_request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public.leave_request_status OWNER TO postgres;

--
-- Name: message_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.message_role AS ENUM (
    'USER',
    'ASSISTANT',
    'SYSTEM'
);


ALTER TYPE public.message_role OWNER TO postgres;

--
-- Name: notification_channel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_channel AS ENUM (
    'EMAIL',
    'WHATSAPP',
    'SMS',
    'IN_APP'
);


ALTER TYPE public.notification_channel OWNER TO postgres;

--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_status AS ENUM (
    'PENDING',
    'SENT',
    'FAILED'
);


ALTER TYPE public.notification_status OWNER TO postgres;

--
-- Name: plan; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.plan AS ENUM (
    'TRIAL',
    'STARTER',
    'PROFESSIONAL',
    'ENTERPRISE'
);


ALTER TYPE public.plan OWNER TO postgres;

--
-- Name: risk_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.risk_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public.risk_level OWNER TO postgres;

--
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'SUPER_ADMIN',
    'COMPANY_ADMIN',
    'HR_MANAGER',
    'MANAGER',
    'EMPLOYEE',
    'AUDITOR'
);


ALTER TYPE public.role OWNER TO postgres;

--
-- Name: workflow_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.workflow_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'ESCALATED',
    'CANCELLED'
);


ALTER TYPE public.workflow_status OWNER TO postgres;

--
-- Name: workflow_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.workflow_type AS ENUM (
    'LEAVE',
    'PROMOTION',
    'DOCUMENT',
    'EXPENSE',
    'RECRUITMENT',
    'CUSTOM'
);


ALTER TYPE public.workflow_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: ai_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_conversations (
    id text NOT NULL,
    tenant_id text NOT NULL,
    user_id text NOT NULL,
    title text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ai_conversations OWNER TO postgres;

--
-- Name: ai_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_messages (
    id text NOT NULL,
    conversation_id text NOT NULL,
    tenant_id text NOT NULL,
    user_id text NOT NULL,
    role public.message_role NOT NULL,
    content text NOT NULL,
    confidence double precision,
    citations jsonb,
    sources_used jsonb,
    prompt_tokens integer,
    completion_tokens integer,
    model_used text,
    processing_ms integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ai_messages OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    tenant_id text,
    user_id text,
    user_email text,
    user_role text,
    action text NOT NULL,
    resource text NOT NULL,
    resource_id text,
    description text NOT NULL,
    metadata jsonb,
    ai_prompt text,
    ai_response text,
    ai_source_documents jsonb,
    ip_address text,
    user_agent text,
    http_method text,
    http_path text,
    http_status integer,
    duration_ms integer,
    severity public.audit_severity DEFAULT 'INFO'::public.audit_severity NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id text NOT NULL,
    tenant_id text NOT NULL,
    company_id text NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    postcode text NOT NULL,
    is_headquarters boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id text NOT NULL,
    tenant_id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    legal_name text,
    reg_number text,
    tax_number text,
    industry text NOT NULL,
    size public.company_size DEFAULT 'SMALL'::public.company_size NOT NULL,
    country public.country NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    postcode text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    website text,
    logo_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: compliance_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compliance_records (
    id text NOT NULL,
    tenant_id text NOT NULL,
    company_id text NOT NULL,
    score integer NOT NULL,
    risk_level public.risk_level NOT NULL,
    checklist jsonb NOT NULL,
    missing_policies jsonb NOT NULL,
    report_url text,
    notes text,
    assessed_at timestamp(3) without time zone NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.compliance_records OWNER TO postgres;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contracts (
    id text NOT NULL,
    tenant_id text NOT NULL,
    employee_id text NOT NULL,
    company_id text NOT NULL,
    contract_type public.contract_type NOT NULL,
    start_date date NOT NULL,
    end_date date,
    "position" text NOT NULL,
    department text NOT NULL,
    salary numeric(15,2) NOT NULL,
    currency text DEFAULT 'MYR'::text NOT NULL,
    working_hours_per_week integer NOT NULL,
    status public.contract_status DEFAULT 'DRAFT'::public.contract_status NOT NULL,
    document_url text,
    notes text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contracts OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id text NOT NULL,
    tenant_id text NOT NULL,
    company_id text NOT NULL,
    name text NOT NULL,
    code text,
    parent_department_id text,
    manager_id text,
    budget numeric(15,2),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: document_chunks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_chunks (
    id text NOT NULL,
    knowledge_base_id text NOT NULL,
    tenant_id text,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    content_tokens integer NOT NULL,
    page_number integer,
    section_title text,
    embedding public.vector(1536),
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.document_chunks OWNER TO postgres;

--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_templates (
    id text NOT NULL,
    tenant_id text NOT NULL,
    type public.document_type NOT NULL,
    name text NOT NULL,
    description text,
    content text NOT NULL,
    variables jsonb NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.document_templates OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    tenant_id text NOT NULL,
    company_id text NOT NULL,
    employee_id text,
    type public.document_type NOT NULL,
    title text NOT NULL,
    description text,
    status public.document_status DEFAULT 'DRAFT'::public.document_status NOT NULL,
    template_data jsonb NOT NULL,
    pdf_url text,
    docx_url text,
    file_size integer,
    generated_at timestamp(3) without time zone,
    sent_at timestamp(3) without time zone,
    acknowledged_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone,
    generated_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: employee_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_files (
    id text NOT NULL,
    tenant_id text NOT NULL,
    employee_id text NOT NULL,
    category public.file_category NOT NULL,
    title text NOT NULL,
    file_url text NOT NULL,
    file_size integer NOT NULL,
    mime_type text NOT NULL,
    expiry_date date,
    is_encrypted boolean DEFAULT false NOT NULL,
    uploaded_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.employee_files OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id text NOT NULL,
    tenant_id text NOT NULL,
    company_id text NOT NULL,
    user_id text,
    employee_number text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    preferred_name text,
    date_of_birth date NOT NULL,
    gender public.gender NOT NULL,
    nationality text NOT NULL,
    nric_passport text NOT NULL,
    visa_details text,
    personal_email text NOT NULL,
    work_email text NOT NULL,
    phone text NOT NULL,
    mobile text,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    postcode text NOT NULL,
    country public.country NOT NULL,
    department_id text,
    team_id text,
    branch_id text,
    manager_id text,
    job_title text NOT NULL,
    job_level text,
    salary_band text,
    employment_type public.employment_type NOT NULL,
    employment_status public.employment_status DEFAULT 'PROBATION'::public.employment_status NOT NULL,
    hire_date date NOT NULL,
    confirmation_date date,
    termination_date date,
    probation_end_date date,
    notice_period_days integer DEFAULT 30 NOT NULL,
    base_salary text,
    bank_name text,
    bank_account text,
    bank_code text,
    emergency_contact_name text NOT NULL,
    emergency_contact_phone text NOT NULL,
    emergency_contact_relation text NOT NULL,
    avatar_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: handbook_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.handbook_policies (
    id text NOT NULL,
    tenant_id text NOT NULL,
    company_id text NOT NULL,
    name text NOT NULL,
    version text NOT NULL,
    country public.country NOT NULL,
    policies jsonb NOT NULL,
    status public.handbook_status DEFAULT 'DRAFT'::public.handbook_status NOT NULL,
    handbook_url text,
    code_of_conduct_url text,
    published_at timestamp(3) without time zone,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.handbook_policies OWNER TO postgres;

--
-- Name: knowledge_bases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knowledge_bases (
    id text NOT NULL,
    tenant_id text,
    name text NOT NULL,
    description text,
    type public.knowledge_base_type NOT NULL,
    country public.country NOT NULL,
    jurisdiction text,
    is_system_document boolean DEFAULT false NOT NULL,
    status public.knowledge_base_status DEFAULT 'PENDING'::public.knowledge_base_status NOT NULL,
    file_url text NOT NULL,
    file_size integer NOT NULL,
    mime_type text NOT NULL,
    page_count integer,
    chunk_count integer DEFAULT 0 NOT NULL,
    error_message text,
    processed_at timestamp(3) without time zone,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.knowledge_bases OWNER TO postgres;

--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_balances (
    id text NOT NULL,
    tenant_id text NOT NULL,
    employee_id text NOT NULL,
    leave_type_id text NOT NULL,
    year integer NOT NULL,
    total_days numeric(5,2) NOT NULL,
    taken_days numeric(5,2) DEFAULT 0 NOT NULL,
    pending_days numeric(5,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.leave_balances OWNER TO postgres;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id text NOT NULL,
    tenant_id text NOT NULL,
    employee_id text NOT NULL,
    leave_type_id text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days numeric(5,2) NOT NULL,
    reason text NOT NULL,
    status public.leave_request_status DEFAULT 'PENDING'::public.leave_request_status NOT NULL,
    manager_id text,
    reviewed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_types (
    id text NOT NULL,
    tenant_id text NOT NULL,
    name text NOT NULL,
    description text,
    is_paid boolean DEFAULT true NOT NULL,
    default_days integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.leave_types OWNER TO postgres;

--
-- Name: lifecycle_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lifecycle_events (
    id text NOT NULL,
    tenant_id text NOT NULL,
    employee_id text NOT NULL,
    previous_status public.employment_status NOT NULL,
    new_status public.employment_status NOT NULL,
    effective_date date NOT NULL,
    reason text,
    changed_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lifecycle_events OWNER TO postgres;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_logs (
    id text NOT NULL,
    tenant_id text NOT NULL,
    user_id text NOT NULL,
    channel public.notification_channel NOT NULL,
    type text NOT NULL,
    status public.notification_status DEFAULT 'PENDING'::public.notification_status NOT NULL,
    error text,
    sent_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification_logs OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    tenant_id text NOT NULL,
    type text NOT NULL,
    channel public.notification_channel NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    role public.role NOT NULL,
    resource text NOT NULL,
    action text NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    tenant_id text NOT NULL,
    refresh_token text NOT NULL,
    device_info text,
    ip_address text,
    expires_at timestamp(3) without time zone NOT NULL,
    revoked_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id text NOT NULL,
    tenant_id text NOT NULL,
    department_id text NOT NULL,
    name text NOT NULL,
    manager_id text,
    budget numeric(15,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    plan public.plan DEFAULT 'TRIAL'::public.plan NOT NULL,
    country public.country NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    settings jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    tenant_id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public.role DEFAULT 'EMPLOYEE'::public.role NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    mfa_enabled boolean DEFAULT false NOT NULL,
    mfa_secret text,
    email_verified boolean DEFAULT false NOT NULL,
    last_login_at timestamp(3) without time zone,
    password_reset_token text,
    password_reset_expiry timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: workflow_instances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_instances (
    id text NOT NULL,
    tenant_id text NOT NULL,
    template_id text NOT NULL,
    status public.workflow_status DEFAULT 'PENDING'::public.workflow_status NOT NULL,
    current_level integer DEFAULT 1 NOT NULL,
    target_resource text NOT NULL,
    target_id text NOT NULL,
    requester_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.workflow_instances OWNER TO postgres;

--
-- Name: workflow_step_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_step_logs (
    id text NOT NULL,
    instance_id text NOT NULL,
    level integer NOT NULL,
    status public.workflow_status NOT NULL,
    approver_id text NOT NULL,
    comments text,
    action_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.workflow_step_logs OWNER TO postgres;

--
-- Name: workflow_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_templates (
    id text NOT NULL,
    tenant_id text NOT NULL,
    type public.workflow_type NOT NULL,
    name text NOT NULL,
    steps jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.workflow_templates OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: ai_conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_conversations (id, tenant_id, user_id, title, is_active, created_at, updated_at) FROM stdin;
575889d4-7d7e-4577-ad1f-36d4c7f72c85	1d34ba2a-c56a-4357-83c4-0649fd7843c1	9f4abd35-38ed-45e5-97ac-b4dff28395cf	What is the notice period for ...	t	2026-06-18 06:58:10.883	2026-06-18 06:58:10.883
16d684af-f8c1-446a-9697-1cd3c715af23	a6c4eeea-cdfa-4985-95cb-6946bd5abc13	e5f349b1-de2a-4308-ae55-e9315354504a	What is the notice period for ...	t	2026-06-18 06:59:01.21	2026-06-18 06:59:01.21
2b7ff96a-9273-4d4a-a4cd-86f87bc7f932	27264cbd-ae9d-4ea4-bfea-026953022ced	8c74ec98-6f6e-41b5-bda6-192541d19233	What is the notice period for ...	t	2026-06-18 07:00:21.564	2026-06-18 07:00:21.564
927bc8b3-8f6f-4876-b1e3-0d25a1b26de8	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	287b723f-85b1-4807-8302-be5a69d9fcd9	What is the notice period for ...	t	2026-06-18 07:29:24.153	2026-06-18 07:29:24.153
45a129f3-b6fc-49fa-a07e-237dc3150a57	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	What is the notice period for ...	t	2026-06-18 07:44:03.248	2026-06-18 07:44:03.248
87dd0105-7341-4451-b7b3-d0f5fbce073d	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	How many days of annual leave ...	t	2026-06-18 07:44:03.829	2026-06-18 07:44:03.829
c5a0331c-9695-4299-be47-ee3025ae1ac4	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	Is there paid maternity leave?...	t	2026-06-18 07:44:04.093	2026-06-18 07:44:04.093
8e00cc5e-5257-47aa-9624-d12e096c3c5c	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	What are the working hours und...	t	2026-06-18 07:44:04.245	2026-06-18 07:44:04.245
e0effc12-7361-47ea-8ff5-abf190895a09	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	How is overtime pay calculated...	t	2026-06-18 07:44:04.394	2026-06-18 07:44:04.394
e3797c12-a081-4a17-9887-5effd72a99dd	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	Can I be fired without a warni...	t	2026-06-18 07:44:04.546	2026-06-18 07:44:04.546
241984db-70d5-47f6-a4d3-debf32e9c3ec	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	What constitutes serious misco...	t	2026-06-18 07:44:04.695	2026-06-18 07:44:04.695
2c2dd7b2-6777-478b-be03-43827f6e0361	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	Are public holidays paid?...	t	2026-06-18 07:44:04.846	2026-06-18 07:44:04.846
d8a596fb-16b3-4ecf-9275-f3ef5b181597	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	How many days of sick leave ca...	t	2026-06-18 07:44:05.003	2026-06-18 07:44:05.003
e2d5f63a-7148-49c9-8ec8-9b9477d67a81	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	Is hospitalization leave separ...	t	2026-06-18 07:44:05.18	2026-06-18 07:44:05.18
e80501d4-543c-41d5-ad24-97ed07760d02	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	What is the notice period for ...	t	2026-06-18 07:45:21.988	2026-06-18 07:45:21.988
b051959e-5f3e-408e-931f-2241e1b124df	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	How many days of annual leave ...	t	2026-06-18 07:45:22.509	2026-06-18 07:45:22.509
aeb647af-d7f6-47a9-b0c7-d40112e46f22	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	Is there paid maternity leave?...	t	2026-06-18 07:45:22.992	2026-06-18 07:45:22.992
2cbec6ba-ea73-4ebd-bd58-031de8ee0999	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	What are the working hours und...	t	2026-06-18 07:45:23.251	2026-06-18 07:45:23.251
cd68f48f-2577-4c5f-a476-a8f6d8d85379	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	How is overtime pay calculated...	t	2026-06-18 07:45:23.4	2026-06-18 07:45:23.4
56ad9652-f592-44ac-afee-667d75186343	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	Can I be fired without a warni...	t	2026-06-18 07:45:23.546	2026-06-18 07:45:23.546
a322612a-610b-4e17-a03a-ba8b9d7b6d9e	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	What constitutes serious misco...	t	2026-06-18 07:45:24.034	2026-06-18 07:45:24.034
640467f4-ba48-479c-9dd2-91f8967d048e	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	Are public holidays paid?...	t	2026-06-18 07:45:24.182	2026-06-18 07:45:24.182
afe1b404-31c2-45f7-9380-544303a71d01	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	How many days of sick leave ca...	t	2026-06-18 07:45:24.455	2026-06-18 07:45:24.455
55781d4f-5ecd-4403-a5c3-42f520a13213	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	Is hospitalization leave separ...	t	2026-06-18 07:45:24.601	2026-06-18 07:45:24.601
9d79a260-d898-4e9a-afee-32e67bc6e036	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	What is the notice period for ...	t	2026-06-18 07:46:24.791	2026-06-18 07:46:24.791
3ce9a3ca-6626-4c93-98b8-71b68512183e	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	How many days of annual leave ...	t	2026-06-18 07:46:25.333	2026-06-18 07:46:25.333
6a9067bb-d2ce-4571-b164-9ccf307e30b6	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	Is there paid maternity leave?...	t	2026-06-18 07:46:25.646	2026-06-18 07:46:25.646
c1d215a2-aee0-4b6d-b44b-8e829cdf613d	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	What are the working hours und...	t	2026-06-18 07:46:26.06	2026-06-18 07:46:26.06
1cab2ce8-b62e-4919-90c3-0a1a8b6a6431	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	How is overtime pay calculated...	t	2026-06-18 07:46:26.211	2026-06-18 07:46:26.211
0285a1e2-65d2-400e-b87a-4a1c3208bb2b	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	Can I be fired without a warni...	t	2026-06-18 07:46:26.369	2026-06-18 07:46:26.369
dda7574e-db88-430d-9e22-886613b25403	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	What constitutes serious misco...	t	2026-06-18 07:46:26.643	2026-06-18 07:46:26.643
6390697e-a847-4fe2-a2bb-b96d49b9a37f	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	Are public holidays paid?...	t	2026-06-18 07:46:26.913	2026-06-18 07:46:26.913
60fcef37-ade5-4f91-944f-86d5e3b7a7f7	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	How many days of sick leave ca...	t	2026-06-18 07:46:27.089	2026-06-18 07:46:27.089
d64f7c82-26fa-42f2-b00a-68d0a015ca85	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	Is hospitalization leave separ...	t	2026-06-18 07:46:27.241	2026-06-18 07:46:27.241
4cdc1e36-02eb-46cd-b01c-e7a60c69b724	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	What is the overtime rate?...	t	2026-06-18 08:37:22.574	2026-06-18 08:37:22.574
df9c5e3a-04ce-4c68-93b1-9f3e7be4951d	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	What is the dress code?...	t	2026-06-18 08:37:23.359	2026-06-18 08:37:23.359
e0a06874-af14-4e01-a3a5-8d3e6388ea9d	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	What is the overtime rate?...	t	2026-06-18 08:38:12.949	2026-06-18 08:38:12.949
7ffb33a5-35fa-4c6b-9101-6d5c25660953	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	What is the overtime rate?...	t	2026-06-18 08:38:40.823	2026-06-18 08:38:40.823
b4662b03-c555-49ae-a088-4579cd69b4a4	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	What is the overtime rate?...	t	2026-06-18 08:39:11.118	2026-06-18 08:39:11.118
63cad866-9cfa-491a-9c80-51d23d2c1af5	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	What is the dress code?...	t	2026-06-18 08:39:11.621	2026-06-18 08:39:11.621
17aa9645-b28b-47a4-913f-438581430c02	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	What is the overtime rate?...	t	2026-06-18 08:39:49.108	2026-06-18 08:39:49.108
c4d880f9-6d2f-4608-9d86-0a6cbc66b9e4	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	What is the dress code?...	t	2026-06-18 08:39:49.784	2026-06-18 08:39:49.784
2383636a-f4b4-443a-8a02-8ccf7d9c8c23	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	What is the overtime rate?...	t	2026-06-18 08:40:25.459	2026-06-18 08:40:25.459
2d7299ba-d380-4dbc-be0b-24ad71b15eb9	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	What is the dress code?...	t	2026-06-18 08:40:25.915	2026-06-18 08:40:25.915
e137e7fb-5b33-4873-bd3c-cc82fba1ff61	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	What is the overtime rate?...	t	2026-06-18 08:40:52.814	2026-06-18 08:40:52.814
0824911c-e36a-46b6-97a6-bf51462ea967	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	What is the dress code?...	t	2026-06-18 08:40:53.456	2026-06-18 08:40:53.456
\.


--
-- Data for Name: ai_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_messages (id, conversation_id, tenant_id, user_id, role, content, confidence, citations, sources_used, prompt_tokens, completion_tokens, model_used, processing_ms, created_at) FROM stdin;
7af27795-2089-4057-808c-5814805da517	575889d4-7d7e-4577-ad1f-36d4c7f72c85	1d34ba2a-c56a-4357-83c4-0649fd7843c1	9f4abd35-38ed-45e5-97ac-b4dff28395cf	USER	What is the notice period for resignation?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 06:58:10.888
80556ec3-78b3-403e-aede-9b2d2b1972c2	16d684af-f8c1-446a-9697-1cd3c715af23	a6c4eeea-cdfa-4985-95cb-6946bd5abc13	e5f349b1-de2a-4308-ae55-e9315354504a	USER	What is the notice period for resignation?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 06:59:01.215
82bcd96b-f306-4d5c-a163-0456cd28e7a0	2b7ff96a-9273-4d4a-a4cd-86f87bc7f932	27264cbd-ae9d-4ea4-bfea-026953022ced	8c74ec98-6f6e-41b5-bda6-192541d19233	USER	What is the notice period for resignation?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:00:21.569
9d260449-d501-44bd-a84c-ea151972fb4a	927bc8b3-8f6f-4876-b1e3-0d25a1b26de8	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	287b723f-85b1-4807-8302-be5a69d9fcd9	USER	What is the notice period for resignation?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:29:24.157
9ec8362f-9eca-41c8-8493-befde0ee13c9	45a129f3-b6fc-49fa-a07e-237dc3150a57	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	What is the notice period for resignation?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:03.253
364f6ea9-6675-491f-bfd3-f7a8ba781409	87dd0105-7341-4451-b7b3-d0f5fbce073d	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	How many days of annual leave am I entitled to?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:03.832
3b9d58cb-db90-433a-b04f-e88dc277998e	c5a0331c-9695-4299-be47-ee3025ae1ac4	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	Is there paid maternity leave?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:04.095
5260135b-ef3d-41fa-a9e7-8f2e282ebd44	8e00cc5e-5257-47aa-9624-d12e096c3c5c	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	What are the working hours under the Employment Act?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:04.247
d4a72e35-e009-4272-a04d-9c16e0d7c9f8	e0effc12-7361-47ea-8ff5-abf190895a09	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	How is overtime pay calculated?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:04.396
2683c989-91c0-4984-a4d4-43e7e59d0da1	e3797c12-a081-4a17-9887-5effd72a99dd	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	Can I be fired without a warning letter?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:04.548
34d603db-ca15-45fe-b02a-848080f8f441	241984db-70d5-47f6-a4d3-debf32e9c3ec	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	What constitutes serious misconduct?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:04.7
fef3866b-deb6-4908-b538-0548303ce95d	2c2dd7b2-6777-478b-be03-43827f6e0361	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	Are public holidays paid?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:04.849
04f7b30b-a406-4eb9-87fa-a10482407646	d8a596fb-16b3-4ecf-9275-f3ef5b181597	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	How many days of sick leave can I take?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:05.023
a0232186-73fe-4ff1-81db-5c8af896a416	e2d5f63a-7148-49c9-8ec8-9b9477d67a81	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	USER	Is hospitalization leave separate from sick leave?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:44:05.182
67a3d4a7-b3cf-4225-adac-8637df3f91cd	e80501d4-543c-41d5-ad24-97ed07760d02	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	What is the notice period for resignation?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:21.993
a21f6e15-43c8-44bb-8f69-9b4837c72e90	b051959e-5f3e-408e-931f-2241e1b124df	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	How many days of annual leave am I entitled to?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:22.511
d67f2ed2-5251-42f6-99fd-f38b3a78b5cd	aeb647af-d7f6-47a9-b0c7-d40112e46f22	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	Is there paid maternity leave?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:22.994
40f9bf20-5512-4ec6-aaf7-92969ec34ae1	2cbec6ba-ea73-4ebd-bd58-031de8ee0999	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	What are the working hours under the Employment Act?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:23.253
95613e89-019e-47bc-83cb-334b4c569980	cd68f48f-2577-4c5f-a476-a8f6d8d85379	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	How is overtime pay calculated?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:23.402
7cc89937-f03b-4d5c-abe1-2abb7fcc8497	56ad9652-f592-44ac-afee-667d75186343	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	Can I be fired without a warning letter?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:23.548
73442add-fdd4-4a5c-8fd7-dbe62530e702	a322612a-610b-4e17-a03a-ba8b9d7b6d9e	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	What constitutes serious misconduct?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:24.036
e39e759d-cc0c-4c09-9c59-19756fc80142	640467f4-ba48-479c-9dd2-91f8967d048e	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	Are public holidays paid?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:24.184
5273d4e7-b089-43f8-aa76-b9c1ff2fb011	afe1b404-31c2-45f7-9380-544303a71d01	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	How many days of sick leave can I take?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:24.457
c028fb0d-5907-4ff8-bbb4-9d0d6b991d04	55781d4f-5ecd-4403-a5c3-42f520a13213	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	USER	Is hospitalization leave separate from sick leave?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:45:24.603
1414f24d-0779-4d44-9ce8-7be4734c8383	9d79a260-d898-4e9a-afee-32e67bc6e036	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	What is the notice period for resignation?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:24.796
a42de986-2bda-4a2e-b9eb-fede3470ef70	3ce9a3ca-6626-4c93-98b8-71b68512183e	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	How many days of annual leave am I entitled to?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:25.338
6b2fac5e-8f34-4097-b839-85b8d0262ff1	6a9067bb-d2ce-4571-b164-9ccf307e30b6	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	Is there paid maternity leave?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:25.649
0ccc1048-6687-46fc-b8ba-62d69bc1014f	c1d215a2-aee0-4b6d-b44b-8e829cdf613d	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	What are the working hours under the Employment Act?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:26.062
ea0b6868-bce9-4b19-89bc-be61835e0d71	1cab2ce8-b62e-4919-90c3-0a1a8b6a6431	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	How is overtime pay calculated?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:26.213
db0492a7-5edd-46ea-b897-2adcf191a211	0285a1e2-65d2-400e-b87a-4a1c3208bb2b	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	Can I be fired without a warning letter?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:26.377
be007f1b-fcce-4fd3-867a-20df17ad2052	dda7574e-db88-430d-9e22-886613b25403	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	What constitutes serious misconduct?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:26.646
c1c1e06a-0b34-4268-b3e0-89c94e71ed8f	6390697e-a847-4fe2-a2bb-b96d49b9a37f	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	Are public holidays paid?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:26.915
b599e9b1-fcbb-4611-add8-1c1364dff951	60fcef37-ade5-4f91-944f-86d5e3b7a7f7	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	How many days of sick leave can I take?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:27.091
52bb5d63-cc1c-4cf3-8982-75fa1cf7873b	d64f7c82-26fa-42f2-b00a-68d0a015ca85	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	USER	Is hospitalization leave separate from sick leave?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 07:46:27.244
13e3c749-79a6-4448-8969-9e3548f22895	4cdc1e36-02eb-46cd-b01c-e7a60c69b724	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	USER	What is the overtime rate?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:37:22.576
e23aef64-adb8-42e9-99ae-d6f373aaad00	df9c5e3a-04ce-4c68-93b1-9f3e7be4951d	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	USER	What is the dress code?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:37:23.361
c6bb5054-77f0-45c6-bfeb-5faee6adb897	e0a06874-af14-4e01-a3a5-8d3e6388ea9d	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	USER	What is the overtime rate?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:38:12.951
329029cb-662f-41e6-8033-67583f90d185	7ffb33a5-35fa-4c6b-9101-6d5c25660953	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	USER	What is the overtime rate?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:38:40.825
1c869985-9477-4272-b144-6af38a5d67cd	b4662b03-c555-49ae-a088-4579cd69b4a4	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	USER	What is the overtime rate?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:39:11.121
05d84b1e-8bb6-4e8f-9817-a5db2f903df5	63cad866-9cfa-491a-9c80-51d23d2c1af5	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	USER	What is the dress code?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:39:11.623
deae8609-21cf-403c-a983-39b8f3f6ccdf	17aa9645-b28b-47a4-913f-438581430c02	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	USER	What is the overtime rate?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:39:49.11
c570e47b-e1f8-475a-841a-d2e9786c679e	c4d880f9-6d2f-4608-9d86-0a6cbc66b9e4	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	USER	What is the dress code?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:39:49.786
6cc378dc-4b90-40b6-8bbe-9735a832b5c3	2383636a-f4b4-443a-8a02-8ccf7d9c8c23	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	USER	What is the overtime rate?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:40:25.463
91858761-3dec-47a6-b94e-e715af5d6589	2d7299ba-d380-4dbc-be0b-24ad71b15eb9	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	USER	What is the dress code?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:40:25.917
adc73d62-8bcd-407d-a72c-355f9383d4d6	e137e7fb-5b33-4873-bd3c-cc82fba1ff61	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	USER	What is the overtime rate?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:40:52.816
eef6de49-691a-47a0-83c4-b68aa3512914	0824911c-e36a-46b6-97a6-bf51462ea967	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	USER	What is the dress code?	\N	\N	\N	\N	\N	\N	\N	2026-06-18 08:40:53.458
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, tenant_id, user_id, user_email, user_role, action, resource, resource_id, description, metadata, ai_prompt, ai_response, ai_source_documents, ip_address, user_agent, http_method, http_path, http_status, duration_ms, severity, "timestamp") FROM stdin;
b6bfeffd-b061-4210-8391-2a91118765e5	5c8ccc82-eb63-47a9-bd13-90b2a793a285	41312bdf-68e5-41e7-872c-0475fca75298	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781765812900@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 06:56:53.183
3ca71ddc-49f1-4526-be80-1ba9d085d22c	5c8ccc82-eb63-47a9-bd13-90b2a793a285	41312bdf-68e5-41e7-872c-0475fca75298	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781765812900@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 06:56:53.324
b40eb61a-cf7a-4630-864d-ddfebbb1b1c3	b216cce6-2045-44f3-ba0b-039f1e71bc9f	5df059fc-3f78-4202-af4e-1232ae27915e	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781765829608@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 06:57:09.793
8fb22c62-bee3-4d1a-b46b-32ef8ee5b926	b216cce6-2045-44f3-ba0b-039f1e71bc9f	5df059fc-3f78-4202-af4e-1232ae27915e	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781765829608@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 06:57:09.909
b14efb79-1bf9-4a14-a52d-4ed966ea79f8	1d34ba2a-c56a-4357-83c4-0649fd7843c1	9f4abd35-38ed-45e5-97ac-b4dff28395cf	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781765890605@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 06:58:10.739
8ec19d24-ba33-4b16-8187-201a52ba4424	1d34ba2a-c56a-4357-83c4-0649fd7843c1	9f4abd35-38ed-45e5-97ac-b4dff28395cf	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781765890605@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 06:58:10.825
da664216-c1ed-492a-ba6c-381112356f38	a6c4eeea-cdfa-4985-95cb-6946bd5abc13	e5f349b1-de2a-4308-ae55-e9315354504a	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781765939706@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 06:58:59.862
64ceae48-877f-4b9c-9aa9-cf02ad4995bf	a6c4eeea-cdfa-4985-95cb-6946bd5abc13	e5f349b1-de2a-4308-ae55-e9315354504a	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781765939706@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 06:58:59.982
0092c19e-d1c1-47bb-a491-5c875bdf6f60	27264cbd-ae9d-4ea4-bfea-026953022ced	8c74ec98-6f6e-41b5-bda6-192541d19233	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781766019951@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:00:20.243
6b8f0911-bf06-42d3-b21c-474524b20e6a	27264cbd-ae9d-4ea4-bfea-026953022ced	8c74ec98-6f6e-41b5-bda6-192541d19233	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781766019951@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:00:20.354
4080e686-1ac1-485f-b614-51077afaf288	27264cbd-ae9d-4ea4-bfea-026953022ced	8c74ec98-6f6e-41b5-bda6-192541d19233	\N	\N	LIFECYCLE_TRANSITION	Employee	b8d9d4ec-0a46-48e4-859b-946e48accfc4	Employee transitioned from ${previousStatus} to ${newStatus}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:00:20.542
6b42768a-a98c-425a-9d0c-6b53eecfecab	f70e4da0-e903-4352-b249-33d70013f09c	71a2d99b-4788-4bfb-b355-d8ad2ec17f7c	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781767739013@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:28:59.235
0c14f2cc-9da5-4498-a14a-6409eb05e017	f70e4da0-e903-4352-b249-33d70013f09c	71a2d99b-4788-4bfb-b355-d8ad2ec17f7c	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781767739013@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:28:59.331
05a499d8-33c5-45b5-929d-bd28b901381c	f70e4da0-e903-4352-b249-33d70013f09c	71a2d99b-4788-4bfb-b355-d8ad2ec17f7c	\N	\N	TOKEN_REFRESHED	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:28:59.395
45f4556f-2f06-4049-8c4a-c65bf2ff0b95	f70e4da0-e903-4352-b249-33d70013f09c	71a2d99b-4788-4bfb-b355-d8ad2ec17f7c	\N	\N	LIFECYCLE_TRANSITION	Employee	3faae3ef-9225-41b8-9456-478c81e3c17d	Employee transitioned from ${previousStatus} to ${newStatus}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:28:59.583
0d398c13-1505-46fb-8eb0-ef46e6541887	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	287b723f-85b1-4807-8302-be5a69d9fcd9	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781767762768@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:29:22.923
e25b7285-3daa-4245-98fc-88956ab7f8e2	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	287b723f-85b1-4807-8302-be5a69d9fcd9	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781767762768@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:29:23.003
c1d8b739-5c83-4fb1-89ab-0b8626a0ae40	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	287b723f-85b1-4807-8302-be5a69d9fcd9	\N	\N	TOKEN_REFRESHED	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:29:23.033
a8fefadc-86fa-40f3-b7f9-49af04dce98f	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	287b723f-85b1-4807-8302-be5a69d9fcd9	\N	\N	LIFECYCLE_TRANSITION	Employee	c0622bc0-df90-4f61-b7e8-a76fa30d0028	Employee transitioned from ${previousStatus} to ${newStatus}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:29:23.125
bdcd9085-8bd2-4339-a84f-420ed0697dc6	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	287b723f-85b1-4807-8302-be5a69d9fcd9	\N	\N	COMPLIANCE_AUDIT_RUN	ComplianceRecord	56a7f4ad-5a56-4deb-a87e-c427402e71eb	Compliance audit executed. Score: ${score}, Risk: ${riskLevel}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:29:24.91
da29e267-cfe0-41cc-ae4f-2f200d1172ed	dfb5a372-779a-49af-90a9-fc7ad3b899ba	def43404-6c88-4050-9a06-fd3631d8e9e7	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "hacker+1781767764921@hacker.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:29:25.009
7db4bee7-b4bc-4b1b-ba06-4fb6eb24151e	dfb5a372-779a-49af-90a9-fc7ad3b899ba	def43404-6c88-4050-9a06-fd3631d8e9e7	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "hacker+1781767764921@hacker.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:29:25.077
5dc501ef-5e7f-4309-997d-839bec92a38a	\N	287b723f-85b1-4807-8302-be5a69d9fcd9	\N	\N	USER_LOGOUT	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:29:25.109
abdc040d-5fba-472d-963c-0ed96f28d5cc	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781768641509@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:44:01.732
c19260cd-2fea-4dfa-b90b-00239149cf77	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781768641509@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:44:01.838
121c4b94-2cb8-4242-841f-139051e5aadf	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	\N	\N	TOKEN_REFRESHED	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:44:01.937
ae109528-6783-4fac-a63b-3a15ce3f7e19	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	\N	\N	LIFECYCLE_TRANSITION	Employee	215c6592-b621-48d6-821c-d412f580a09a	Employee transitioned from ${previousStatus} to ${newStatus}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:44:02.204
bc2d3be4-abee-4a6e-a02b-8f8d3f88b509	19a8e217-533b-4237-856c-45d9e2ca4a3d	afedaadc-7dd6-4bda-b7c2-337216f32a45	\N	\N	COMPLIANCE_AUDIT_RUN	ComplianceRecord	ced575bb-c637-4ef9-9510-4f713be2c3b7	Compliance audit executed. Score: ${score}, Risk: ${riskLevel}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:44:05.486
25a42cbd-ccb9-4dd9-8eb8-0b1f8793c1ce	96f61e58-870c-41a9-bd41-9ff040db14b3	d66eb176-75cf-471a-a7b0-c0732ca4c549	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "hacker+1781768645504@hacker.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:44:05.599
1a067ef2-6ba5-482e-8498-d303f134ff26	96f61e58-870c-41a9-bd41-9ff040db14b3	d66eb176-75cf-471a-a7b0-c0732ca4c549	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "hacker+1781768645504@hacker.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:44:05.672
58b5788e-1841-423d-812a-53bea260fb32	\N	afedaadc-7dd6-4bda-b7c2-337216f32a45	\N	\N	USER_LOGOUT	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:44:05.706
747cecf6-f3ba-4e45-aa55-e70b93b9a437	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781768720597@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:45:20.742
5e0083ab-5be2-47f9-b59e-d415d1915aab	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781768720597@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:45:20.825
de586c08-3bdd-4378-a0e2-a748b0dc71b1	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	\N	\N	TOKEN_REFRESHED	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:45:20.848
c65c832b-b6dc-4b8f-87d6-3017b3a492df	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	10f3962d-335e-422c-a7ad-99db8ef5e7a5	\N	\N	COMPLIANCE_AUDIT_RUN	ComplianceRecord	fa21bf6b-3367-4026-bfc0-9d311a6a079f	Compliance audit executed. Score: ${score}, Risk: ${riskLevel}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:45:24.83
6729dc76-4c69-4f81-81d2-e5e80a70c28f	11e7805e-a79b-4b31-8a7c-b3573bac6e82	a3d5f0b0-3439-403a-8fd4-77fec0a50f3d	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "hacker+1781768724839@hacker.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:45:24.988
87362c80-47e0-4636-8386-6e99061ba3e2	\N	10f3962d-335e-422c-a7ad-99db8ef5e7a5	\N	\N	USER_LOGOUT	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:45:25.009
8f62c01f-b74b-42c6-9765-cbb55590261b	11e7805e-a79b-4b31-8a7c-b3573bac6e82	a3d5f0b0-3439-403a-8fd4-77fec0a50f3d	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "hacker+1781768724839@hacker.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:45:24.926
456ed096-c314-4116-b242-acbcd41cfc23	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "roy+1781768782400@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:22.882
63122a0f-b892-4f40-a8c4-d06b42514f88	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy+1781768782400@democorp.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:23.102
6bc3bbba-104c-4b6c-8c14-010ddcd8dc9f	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	\N	\N	TOKEN_REFRESHED	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:23.272
8773d680-452a-41ba-a3f3-34326a5b142e	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	\N	\N	LIFECYCLE_TRANSITION	Employee	67ec3eb0-13ff-4a28-9521-7062ed542778	Employee transitioned from ${previousStatus} to ${newStatus}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:23.657
6cb3e810-9746-4d94-9047-9ae223d3f3a8	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	\N	\N	LEAVE_REQUEST_CREATED	LeaveRequest	8963966e-7313-45c3-9c5a-7df4791b31ad	Leave requested for ${days} days	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:23.743
6114b241-fdb0-4bd4-9842-7950fcd2ad90	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	\N	\N	LEAVE_REQUEST_APPROVED	LeaveRequest	8963966e-7313-45c3-9c5a-7df4791b31ad	Leave request ${request.id} approved	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:23.769
249f0d59-e239-46f5-9c23-8a3af4b57753	9ecf7758-292c-48dc-98ba-89eea040da4a	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	\N	\N	COMPLIANCE_AUDIT_RUN	ComplianceRecord	7982f188-1d74-4e1f-9485-37b42b68b9d7	Compliance audit executed. Score: ${score}, Risk: ${riskLevel}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:27.754
c9f69c2f-006c-40eb-95e5-ca8e1ac4ac28	c4061e22-3f29-44bc-8c85-b8fede14f35d	83a0e027-b041-413c-8d5f-bff389c9bf78	\N	\N	USER_REGISTERED	System	\N	Action ${payload.action} performed	{"role": "COMPANY_ADMIN", "email": "hacker+1781768787766@hacker.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:27.943
6b961e0e-ea18-4024-8561-fa7d8305cdd3	c4061e22-3f29-44bc-8c85-b8fede14f35d	83a0e027-b041-413c-8d5f-bff389c9bf78	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "hacker+1781768787766@hacker.my"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:28.033
158b38e2-ee2f-4ac6-ace0-82aec78febd4	\N	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	\N	\N	USER_LOGOUT	System	\N	Action ${payload.action} performed	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 07:46:28.114
bda1dd42-c576-4130-aa61-e67ec00e141f	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 08:30:30.616
51f11eb1-c535-4c29-b897-ea5012f04bb1	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 07:30:30.619
b447e003-13b5-4c07-8366-73c9aa4b2cc4	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 06:30:30.622
af1340c4-1e94-4648-9c1c-a8b13bcf5ab4	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 05:30:30.625
8af9c443-7e24-4abc-b18d-95807c874211	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 04:30:30.627
c30574ed-f34e-4cb4-b1a3-01512e789665	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 03:30:30.629
9cb6fe91-32b5-40eb-8594-e747599578da	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 02:30:30.632
dad916d5-d7e7-4fdb-9c66-65ce958a95d8	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 01:30:30.634
7143c7e0-d80c-4a41-91f6-6bddbd30d296	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-18 00:30:30.636
b70680c9-1437-4321-aa0f-8879120df73b	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 23:30:30.639
1eb67134-04a4-4a1d-affa-6711e3719ed7	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 22:30:30.644
bba1ee44-0d37-478c-ba92-84b51ad509b8	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 21:30:30.651
46f5c78b-9933-4cb2-80be-b9fa17e3ebd4	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 20:30:30.66
73edeb6f-b3db-4f14-8872-e1192aa9ba28	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 19:30:30.662
2e3b3721-235e-4497-a197-0d5cc06ac4c6	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 18:30:30.664
af82d478-a2dd-4370-a98c-b5e3b0ef43f3	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 17:30:30.681
2882b379-2a63-41c7-9423-839df7ec8cb6	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 16:30:30.826
764388e2-0b04-45c8-959e-a3faa5333a84	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 15:30:30.848
f4fb1b35-ae22-4490-ae94-c5a3e0669a5f	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 14:30:30.851
cb3800af-8e50-463d-b3c2-772d354f4795	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LOGIN	AUTH	\N	User logged in	\N	\N	\N	\N	192.168.1.100	Mozilla/5.0 Chrome	\N	\N	\N	\N	INFO	2026-06-17 13:30:30.864
0ef5110c-c1a2-4a50-a4f1-d7aa16ebfb6a	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:32:34.096
bfb5a3a2-eb6e-4eef-abc3-adddc3c69bdd	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:32:34.314
4988a8e1-b9d8-4b92-9c13-b624a7ccce32	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:34:01.057
d9db467a-f7dc-4acd-820e-b65e32917e3e	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:34:01.168
9d4083f5-2587-4642-ad37-1250cfe7f769	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:34:30.967
afb75725-c2c3-40a5-a963-68455e3954ab	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:34:55.415
7e21ab71-7b0f-4ac8-a5e3-3995c0a6443e	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:34:31.087
5fa99013-fa22-4074-82b3-6bf7b3414d42	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:34:55.791
bb98e5af-f358-4bd6-8657-96cce271ccb0	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:36:40.246
0d5a8a8c-8fe7-4a36-9122-c43db5bee154	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:36:40.698
1b04de33-47fd-4466-8c30-b473d0a3615a	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:37:22.487
ec4f68d8-0061-4086-b61a-48c506077c39	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:37:23.323
32a443bc-0efc-41aa-83ac-818e658d441c	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:38:12.827
72c957e7-7e26-4541-83ec-e2fcb85cbc0c	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:38:13.421
2a710d2b-c850-4d73-acae-8053d831a61e	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:38:40.732
7117abde-cedc-4824-afe5-2f0178c520e4	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:38:41.49
715a0655-9d7f-447e-aa5e-78a73e909b07	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:39:11.022
06bf2643-ec03-4ac7-97ab-29fdc0d557d8	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:39:11.563
21f5a6e2-4845-41d2-a169-f2331f3a657d	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:39:49.009
9339c63c-458b-4f0c-ac51-83fa43bd0e8c	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:39:49.716
f8aedce2-d5af-4d00-8fb4-4148a88fc195	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LEAVE_REQUEST_CREATED	LeaveRequest	b68db779-73e0-4d17-af03-5d7f69180d8b	Leave requested for ${days} days	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:39:49.776
6264f14e-bea7-492b-adf9-18ecfa66de38	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:40:25.338
0d0a62a6-efaa-4c16-b6bd-6e5ce9c5b99a	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:40:25.862
f7e71082-e0e9-4748-a34a-226637675aca	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LEAVE_REQUEST_CREATED	LeaveRequest	b59a8a0d-13de-48cf-814f-ca9d9faff17e	Leave requested for ${days} days	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:40:25.91
957b0506-d2a9-4dee-8f19-769078da00b1	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:40:52.727
aa63e24b-5c19-45a5-baa9-4b33d50c5347	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:40:53.404
3c0315a4-56a6-4516-95a0-490eb0973d1e	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	LEAVE_REQUEST_CREATED	LeaveRequest	3f8e0c98-8886-4940-ae44-ec6d116a14c6	Leave requested for ${days} days	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 08:40:53.452
7ff3cc73-f56b-46e9-9ae5-8308e8503cbb	34d46238-f564-429f-95c6-8301ce538f29	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "roy@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 09:57:32.4
f4af1994-de7b-4b2d-9fdf-9d5a7ec9f32b	34d46238-f564-429f-95c6-8301ce538f29	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "sarah@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 09:57:32.516
b38940ef-c50d-43c1-bd11-ac81b2b62830	34d46238-f564-429f-95c6-8301ce538f29	07e8239b-809c-48f8-a656-b50b8af927ce	\N	\N	USER_LOGIN	System	\N	Action ${payload.action} performed	{"email": "manager@demo.hrmanager4u.ai"}	\N	\N	\N	\N	\N	\N	\N	\N	\N	INFO	2026-06-18 09:57:32.584
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, tenant_id, company_id, name, address, city, state, postcode, is_headquarters, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, tenant_id, slug, name, legal_name, reg_number, tax_number, industry, size, country, address, city, state, postcode, phone, email, website, logo_url, is_active, created_at, updated_at) FROM stdin;
73814447-bf64-4704-9ea1-4d093eaf6717	a6c4eeea-cdfa-4985-95cb-6946bd5abc13	87ad3849-ac83-4c56-a0a5-f4d20e8928f1	Demo Corp HQ	\N	\N	\N	Technology	SMALL	MY	123 Tech Lane	Kuala Lumpur	Kuala Lumpur	50000	+60312345678	contact@democorp.my	\N	\N	t	2026-06-18 06:59:00.147	2026-06-18 06:59:00.147
662dec33-7809-48e5-afa9-4e5165529ac4	27264cbd-ae9d-4ea4-bfea-026953022ced	0e6cbe19-3c2d-48b1-80f5-6f21bc0aae10	Demo Corp HQ	\N	\N	\N	Technology	SMALL	MY	123 Tech Lane	Kuala Lumpur	Kuala Lumpur	50000	+60312345678	contact@democorp.my	\N	\N	t	2026-06-18 07:00:20.492	2026-06-18 07:00:20.492
cb095e1d-b710-4566-945b-eda3cb316a5d	f70e4da0-e903-4352-b249-33d70013f09c	34e6d700-0657-427c-9766-6b2cc98d123e	Demo Corp HQ	\N	\N	\N	Technology	SMALL	MY	123 Tech Lane	Kuala Lumpur	Kuala Lumpur	50000	+60312345678	contact@democorp.my	\N	\N	t	2026-06-18 07:28:59.554	2026-06-18 07:28:59.554
0a1b7d10-f6a0-4e50-a39b-891ba2be34c2	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	51a55736-77d3-439d-b3ce-327f65e025d2	Demo Corp HQ	\N	\N	\N	Technology	SMALL	MY	123 Tech Lane	Kuala Lumpur	Kuala Lumpur	50000	+60312345678	contact@democorp.my	\N	\N	t	2026-06-18 07:29:23.098	2026-06-18 07:29:23.098
bd806eb9-311c-457a-8879-d4b1e4a40652	19a8e217-533b-4237-856c-45d9e2ca4a3d	ee5944d9-12b9-459d-9950-86ff03cf1e7c	Demo Corp HQ	\N	\N	\N	Technology	SMALL	MY	123 Tech Lane	Kuala Lumpur	Kuala Lumpur	50000	+60312345678	contact@democorp.my	\N	\N	t	2026-06-18 07:44:02.147	2026-06-18 07:44:02.147
e7fc6a1a-37f2-4412-9459-5d5f1af04b32	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	4fd5fd8c-c69d-47f8-8344-1f2ab3fa490e	Demo Corp HQ	\N	\N	\N	Technology	SMALL	MY	123 Tech Lane	Kuala Lumpur	Kuala Lumpur	50000	+60312345678	contact@democorp.my	\N	\N	t	2026-06-18 07:45:20.929	2026-06-18 07:45:20.929
8055fd88-7e75-421b-ba3c-5dc3f1d544d3	9ecf7758-292c-48dc-98ba-89eea040da4a	a66c5ce6-d345-4c22-91d4-3163a2f5bc06	Demo Corp HQ	\N	\N	\N	Technology	SMALL	MY	123 Tech Lane	Kuala Lumpur	Kuala Lumpur	50000	+60312345678	contact@democorp.my	\N	\N	t	2026-06-18 07:46:23.566	2026-06-18 07:46:23.566
6afe9526-77eb-4a4a-a7a7-b2369c0690c6	34d46238-f564-429f-95c6-8301ce538f29	e564bd88-890d-4a95-8323-d6d77a80c7a2	Tech Innovators HQ (Company A)	\N	\N	\N	Technology	LARGE	MY	Level 42, Cyber Tower	Cyberjaya	Selangor	63000	+60311112222	hq@techinnovators.my	\N	\N	t	2026-06-18 08:30:30.147	2026-06-18 08:30:30.147
39567408-4256-4d8e-803e-12648dda7abc	34d46238-f564-429f-95c6-8301ce538f29	b57242ae-ffd1-423b-942a-63ef8e342060	Tech Innovators Penang (Company B)	\N	\N	\N	Technology	MEDIUM	MY	Bayan Lepas FTZ	Penang	Penang	11900	+60422223333	penang@techinnovators.my	\N	\N	t	2026-06-18 08:30:30.166	2026-06-18 08:30:30.166
dfab0a39-ba2e-42bf-8c20-905b3720411c	34d46238-f564-429f-95c6-8301ce538f29	ad610ca2-f38e-4c40-9076-f83e24b09665	Tech Innovators Johor (Company C)	\N	\N	\N	Technology	SMALL	MY	Medini Iskandar	Johor Bahru	Johor	79250	+60733334444	johor@techinnovators.my	\N	\N	t	2026-06-18 08:30:30.172	2026-06-18 08:30:30.172
\.


--
-- Data for Name: compliance_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compliance_records (id, tenant_id, company_id, score, risk_level, checklist, missing_policies, report_url, notes, assessed_at, created_by, created_at, updated_at) FROM stdin;
56a7f4ad-5a56-4deb-a87e-c427402e71eb	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	0a1b7d10-f6a0-4e50-a39b-891ba2be34c2	0	CRITICAL	[{"item": "EMPLOYEE_HANDBOOK", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "CODE_OF_CONDUCT", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "DATA_PROTECTION_POLICY", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "SEXUAL_HARASSMENT_POLICY", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}]	["EMPLOYEE_HANDBOOK", "CODE_OF_CONDUCT", "DATA_PROTECTION_POLICY", "SEXUAL_HARASSMENT_POLICY"]	\N	\N	2026-06-18 07:29:24.904	287b723f-85b1-4807-8302-be5a69d9fcd9	2026-06-18 07:29:24.906	2026-06-18 07:29:24.906
ced575bb-c637-4ef9-9510-4f713be2c3b7	19a8e217-533b-4237-856c-45d9e2ca4a3d	bd806eb9-311c-457a-8879-d4b1e4a40652	0	CRITICAL	[{"item": "EMPLOYEE_HANDBOOK", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "CODE_OF_CONDUCT", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "DATA_PROTECTION_POLICY", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "SEXUAL_HARASSMENT_POLICY", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}]	["EMPLOYEE_HANDBOOK", "CODE_OF_CONDUCT", "DATA_PROTECTION_POLICY", "SEXUAL_HARASSMENT_POLICY"]	\N	\N	2026-06-18 07:44:05.481	afedaadc-7dd6-4bda-b7c2-337216f32a45	2026-06-18 07:44:05.482	2026-06-18 07:44:05.482
fa21bf6b-3367-4026-bfc0-9d311a6a079f	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	e7fc6a1a-37f2-4412-9459-5d5f1af04b32	0	CRITICAL	[{"item": "EMPLOYEE_HANDBOOK", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "CODE_OF_CONDUCT", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "DATA_PROTECTION_POLICY", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "SEXUAL_HARASSMENT_POLICY", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}]	["EMPLOYEE_HANDBOOK", "CODE_OF_CONDUCT", "DATA_PROTECTION_POLICY", "SEXUAL_HARASSMENT_POLICY"]	\N	\N	2026-06-18 07:45:24.826	10f3962d-335e-422c-a7ad-99db8ef5e7a5	2026-06-18 07:45:24.827	2026-06-18 07:45:24.827
7982f188-1d74-4e1f-9485-37b42b68b9d7	9ecf7758-292c-48dc-98ba-89eea040da4a	8055fd88-7e75-421b-ba3c-5dc3f1d544d3	0	CRITICAL	[{"item": "EMPLOYEE_HANDBOOK", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "CODE_OF_CONDUCT", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "DATA_PROTECTION_POLICY", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}, {"item": "SEXUAL_HARASSMENT_POLICY", "status": "FAIL", "category": "POLICY_DOCUMENT", "evidence": "Missing"}]	["EMPLOYEE_HANDBOOK", "CODE_OF_CONDUCT", "DATA_PROTECTION_POLICY", "SEXUAL_HARASSMENT_POLICY"]	\N	\N	2026-06-18 07:46:27.742	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	2026-06-18 07:46:27.743	2026-06-18 07:46:27.743
70742710-d12e-43e0-b316-0d80cbe2970b	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	90	LOW	[{"item": "Contract Clauses", "status": "PASS"}, {"item": "Working Hours", "status": "PASS"}]	["Data Privacy Policy"]	\N	\N	2026-06-18 08:30:30.593	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:30:30.593	2026-06-18 08:30:30.593
5350d4fc-f1f9-4217-beab-8d8ff8c4505f	34d46238-f564-429f-95c6-8301ce538f29	39567408-4256-4d8e-803e-12648dda7abc	60	MEDIUM	[{"item": "Overtime Pay", "status": "FAIL"}, {"item": "Minimum Wage", "status": "PASS"}]	["Remote Work Policy", "IT Security Policy"]	\N	\N	2026-06-18 08:30:30.596	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:30:30.596	2026-06-18 08:30:30.596
93c3fa77-5905-492c-bd71-f042ab0ede8e	34d46238-f564-429f-95c6-8301ce538f29	dfab0a39-ba2e-42bf-8c20-905b3720411c	30	HIGH	[{"item": "Statutory Deductions", "status": "FAIL"}, {"item": "Leave Entitlements", "status": "FAIL"}]	["Employee Handbook", "Leave Policy", "Grievance Policy"]	\N	\N	2026-06-18 08:30:30.598	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:30:30.599	2026-06-18 08:30:30.599
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contracts (id, tenant_id, employee_id, company_id, contract_type, start_date, end_date, "position", department, salary, currency, working_hours_per_week, status, document_url, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, tenant_id, company_id, name, code, parent_department_id, manager_id, budget, is_active, created_at, updated_at) FROM stdin;
6155b496-8024-4502-91cd-e50bed5ca586	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	Engineering	\N	\N	\N	\N	t	2026-06-18 08:30:30.191	2026-06-18 08:30:30.191
9c85e0c9-f975-4216-ac3f-805f63143fc8	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	Human Resources	\N	\N	\N	\N	t	2026-06-18 08:30:30.194	2026-06-18 08:30:30.194
\.


--
-- Data for Name: document_chunks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_chunks (id, knowledge_base_id, tenant_id, chunk_index, content, content_tokens, page_number, section_title, embedding, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: document_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_templates (id, tenant_id, type, name, description, content, variables, version, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, tenant_id, company_id, employee_id, type, title, description, status, template_data, pdf_url, docx_url, file_size, generated_at, sent_at, acknowledged_at, expires_at, generated_by, created_at, updated_at) FROM stdin;
948e08ed-658b-4ceb-b165-18aa754abd63	a6c4eeea-cdfa-4985-95cb-6946bd5abc13	73814447-bf64-4704-9ea1-4d093eaf6717	\N	EMPLOYEE_HANDBOOK	Employee Handbook 2026		GENERATED	{"country": "MY"}	http://localhost:9000/hrmanager/tenant/a6c4eeea-cdfa-4985-95cb-6946bd5abc13/docs/62fc6c23-fa34-4e2c-a895-93238ccc0d6e.pdf	\N	\N	\N	\N	\N	\N	e5f349b1-de2a-4308-ae55-e9315354504a	2026-06-18 06:59:01.586	2026-06-18 06:59:01.586
b0108d96-bc28-42ba-80b0-3bd89566a772	27264cbd-ae9d-4ea4-bfea-026953022ced	662dec33-7809-48e5-afa9-4e5165529ac4	\N	EMPLOYEE_HANDBOOK	Employee Handbook 2026		GENERATED	{"country": "MY"}	http://localhost:9000/hrmanager/tenant/27264cbd-ae9d-4ea4-bfea-026953022ced/docs/fca623f0-0eaa-4a47-91b4-b6c459678632.pdf	\N	\N	\N	\N	\N	\N	8c74ec98-6f6e-41b5-bda6-192541d19233	2026-06-18 07:00:22.398	2026-06-18 07:00:22.398
6bef9868-a3fc-4844-9ae2-200ef1c0cbc7	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	0a1b7d10-f6a0-4e50-a39b-891ba2be34c2	\N	EMPLOYEE_HANDBOOK	Employee Handbook 2026		GENERATED	{"country": "MY"}	http://localhost:9000/hrmanager/tenant/a88ac64b-fbd2-41f6-8f7a-250c9fd5e288/docs/c2d7ffb2-66d3-4137-8af2-51fc2e20892d.pdf	\N	\N	\N	\N	\N	\N	287b723f-85b1-4807-8302-be5a69d9fcd9	2026-06-18 07:29:24.878	2026-06-18 07:29:24.878
d8ba6e70-7341-43bd-b833-dd472c63dc4e	19a8e217-533b-4237-856c-45d9e2ca4a3d	bd806eb9-311c-457a-8879-d4b1e4a40652	\N	EMPLOYEE_HANDBOOK	Employee Handbook 2026		GENERATED	{"country": "MY"}	http://localhost:9000/hrmanager/tenant/19a8e217-533b-4237-856c-45d9e2ca4a3d/docs/689a6fc9-68c7-4089-aa7a-8f68b7b84d9f.pdf	\N	\N	\N	\N	\N	\N	afedaadc-7dd6-4bda-b7c2-337216f32a45	2026-06-18 07:44:05.463	2026-06-18 07:44:05.463
56302d25-8d94-4673-858c-b6b9f6581b47	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	e7fc6a1a-37f2-4412-9459-5d5f1af04b32	\N	EMPLOYEE_HANDBOOK	Employee Handbook 2026		GENERATED	{"country": "MY"}	http://localhost:9000/hrmanager/tenant/34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc/docs/c7c3065b-81f9-4045-be31-6cc153816aa9.pdf	\N	\N	\N	\N	\N	\N	10f3962d-335e-422c-a7ad-99db8ef5e7a5	2026-06-18 07:45:24.813	2026-06-18 07:45:24.813
a829f7ef-2ce8-4b81-8347-e501a507548c	9ecf7758-292c-48dc-98ba-89eea040da4a	8055fd88-7e75-421b-ba3c-5dc3f1d544d3	\N	EMPLOYEE_HANDBOOK	Employee Handbook 2026		GENERATED	{"country": "MY"}	http://localhost:9000/hrmanager/tenant/9ecf7758-292c-48dc-98ba-89eea040da4a/docs/7ab936f3-b223-4561-b12a-2db95219152d.pdf	\N	\N	\N	\N	\N	\N	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	2026-06-18 07:46:27.724	2026-06-18 07:46:27.724
00671406-e826-4cad-864f-6119b8569093	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	\N	EMPLOYEE_HANDBOOK	Employee_Handbook.pdf	\N	GENERATED	{}	minio://hrmanager4u/Employee_Handbook.pdf	\N	\N	\N	\N	\N	\N	07e8239b-809c-48f8-a656-b50b8af927ce	2026-06-18 08:30:30.601	2026-06-18 08:30:30.601
19aae84a-c4c4-4829-b1b3-3327b4c7986a	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	86c83d65-b937-49f9-89c1-816eb294d9c0	EMPLOYMENT_CONTRACT	Sarah_Employment_Contract.pdf	\N	GENERATED	{}	minio://hrmanager4u/Sarah_Employment_Contract.pdf	\N	\N	\N	\N	\N	\N	07e8239b-809c-48f8-a656-b50b8af927ce	2026-06-18 08:30:30.603	2026-06-18 08:30:30.603
e1d9660f-7f60-4bac-a01e-c66088b4797e	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	887f6d6d-1fa4-44cc-8453-d6a704933912	WARNING_LETTER	John_Warning_Letter.pdf	\N	GENERATED	{}	minio://hrmanager4u/John_Warning_Letter.pdf	\N	\N	\N	\N	\N	\N	07e8239b-809c-48f8-a656-b50b8af927ce	2026-06-18 08:30:30.61	2026-06-18 08:30:30.61
0c4fa111-25b6-4a73-93e9-fa90af227d49	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	86c83d65-b937-49f9-89c1-816eb294d9c0	CUSTOM	Sarah_Leave_Approval.pdf	\N	GENERATED	{}	minio://hrmanager4u/Sarah_Leave_Approval.pdf	\N	\N	\N	\N	\N	\N	07e8239b-809c-48f8-a656-b50b8af927ce	2026-06-18 08:30:30.612	2026-06-18 08:30:30.612
8795fe17-417a-4262-af6f-94c4a6614479	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	c5a87327-7443-41d2-892e-60d2dbced86d	TERMINATION_LETTER	Kevin_Termination_Letter.pdf	\N	GENERATED	{}	minio://hrmanager4u/Kevin_Termination_Letter.pdf	\N	\N	\N	\N	\N	\N	07e8239b-809c-48f8-a656-b50b8af927ce	2026-06-18 08:30:30.614	2026-06-18 08:30:30.614
f271dd5e-cd64-4ee3-ac30-7b73d2d32e9a	34d46238-f564-429f-95c6-8301ce538f29	73814447-bf64-4704-9ea1-4d093eaf6717	\N	EMPLOYMENT_CONTRACT	Test Contract		GENERATED	{}	http://localhost:9000/hrmanager/tenant/34d46238-f564-429f-95c6-8301ce538f29/docs/e15797a7-5eb2-4c39-99ee-10c1763cb08a.pdf	\N	\N	\N	\N	\N	\N	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:38:12.928	2026-06-18 08:38:12.928
074f0f2b-637b-4625-9169-bf4702135e5e	34d46238-f564-429f-95c6-8301ce538f29	73814447-bf64-4704-9ea1-4d093eaf6717	\N	EMPLOYMENT_CONTRACT	Test Contract		GENERATED	{}	http://localhost:9000/hrmanager/tenant/34d46238-f564-429f-95c6-8301ce538f29/docs/db809277-ad12-445d-9900-cf466de9857f.pdf	\N	\N	\N	\N	\N	\N	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:38:40.802	2026-06-18 08:38:40.802
42290ddf-fe64-4178-81b2-156bee885a5f	34d46238-f564-429f-95c6-8301ce538f29	73814447-bf64-4704-9ea1-4d093eaf6717	\N	EMPLOYMENT_CONTRACT	Test Contract		GENERATED	{}	http://localhost:9000/hrmanager/tenant/34d46238-f564-429f-95c6-8301ce538f29/docs/160dfc20-ebf0-4c80-abe0-532f4f7e4b5b.pdf	\N	\N	\N	\N	\N	\N	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:39:11.1	2026-06-18 08:39:11.1
9d0eb45b-1e28-418d-ad49-f473fa76a17c	34d46238-f564-429f-95c6-8301ce538f29	73814447-bf64-4704-9ea1-4d093eaf6717	\N	EMPLOYMENT_CONTRACT	Test Contract		GENERATED	{}	http://localhost:9000/hrmanager/tenant/34d46238-f564-429f-95c6-8301ce538f29/docs/3bb5eca9-95d8-4618-8fb0-daaba527c1d0.pdf	\N	\N	\N	\N	\N	\N	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:39:49.088	2026-06-18 08:39:49.088
3e214fd4-3c1c-4190-bb7d-fee069c13ff6	34d46238-f564-429f-95c6-8301ce538f29	73814447-bf64-4704-9ea1-4d093eaf6717	\N	EMPLOYMENT_CONTRACT	Test Contract		GENERATED	{}	http://localhost:9000/hrmanager/tenant/34d46238-f564-429f-95c6-8301ce538f29/docs/ab2d3783-f9c0-407e-ab3b-b18309cf5e8b.pdf	\N	\N	\N	\N	\N	\N	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:40:25.44	2026-06-18 08:40:25.44
07920a54-4b52-41bc-91b1-407e90cfb264	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	\N	EMPLOYMENT_CONTRACT	Test Contract		GENERATED	{}	http://localhost:9000/hrmanager/tenant/34d46238-f564-429f-95c6-8301ce538f29/docs/e424db86-8a79-46fe-9570-62c6f8797c83.pdf	\N	\N	\N	\N	\N	\N	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	2026-06-18 08:40:52.792	2026-06-18 08:40:52.792
\.


--
-- Data for Name: employee_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_files (id, tenant_id, employee_id, category, title, file_url, file_size, mime_type, expiry_date, is_encrypted, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, tenant_id, company_id, user_id, employee_number, first_name, last_name, preferred_name, date_of_birth, gender, nationality, nric_passport, visa_details, personal_email, work_email, phone, mobile, address, city, state, postcode, country, department_id, team_id, branch_id, manager_id, job_title, job_level, salary_band, employment_type, employment_status, hire_date, confirmation_date, termination_date, probation_end_date, notice_period_days, base_salary, bank_name, bank_account, bank_code, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, avatar_url, is_active, created_at, updated_at) FROM stdin;
b57c540e-7038-4d91-85e6-aa0029804ada	a6c4eeea-cdfa-4985-95cb-6946bd5abc13	73814447-bf64-4704-9ea1-4d093eaf6717	e5f349b1-de2a-4308-ae55-e9315354504a	EMP-1781765940152	Roy	Demo	\N	1990-01-01	MALE	Malaysian	900101-14-1234	\N	roy+1781765939706@democorp.my	roy+1781765939706@democorp.my	+60123456789	\N	456 Home Street	Petaling Jaya	Selangor	46000	MY	\N	\N	\N	\N	HR Director	\N	\N	FULL_TIME	ACTIVE	2026-06-18	\N	\N	\N	30	\N	\N	\N	\N	Jane Demo	+60123456788	Spouse	\N	t	2026-06-18 06:59:00.154	2026-06-18 06:59:00.191
b8d9d4ec-0a46-48e4-859b-946e48accfc4	27264cbd-ae9d-4ea4-bfea-026953022ced	662dec33-7809-48e5-afa9-4e5165529ac4	8c74ec98-6f6e-41b5-bda6-192541d19233	EMP-1781766020496	Roy	Demo	\N	1990-01-01	MALE	Malaysian	900101-14-1234	\N	roy+1781766019951@democorp.my	roy+1781766019951@democorp.my	+60123456789	\N	456 Home Street	Petaling Jaya	Selangor	46000	MY	\N	\N	\N	\N	HR Director	\N	\N	FULL_TIME	ACTIVE	2026-06-18	\N	\N	\N	30	\N	\N	\N	\N	Jane Demo	+60123456788	Spouse	\N	t	2026-06-18 07:00:20.498	2026-06-18 07:00:20.53
3faae3ef-9225-41b8-9456-478c81e3c17d	f70e4da0-e903-4352-b249-33d70013f09c	cb095e1d-b710-4566-945b-eda3cb316a5d	71a2d99b-4788-4bfb-b355-d8ad2ec17f7c	EMP-1781767739558	Roy	Demo	\N	1990-01-01	MALE	Malaysian	900101-14-1234	\N	roy+1781767739013@democorp.my	roy+1781767739013@democorp.my	+60123456789	\N	456 Home Street	Petaling Jaya	Selangor	46000	MY	\N	\N	\N	\N	HR Director	\N	\N	FULL_TIME	ACTIVE	2026-06-18	\N	\N	\N	30	\N	\N	\N	\N	Jane Demo	+60123456788	Spouse	\N	t	2026-06-18 07:28:59.56	2026-06-18 07:28:59.575
c0622bc0-df90-4f61-b7e8-a76fa30d0028	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	0a1b7d10-f6a0-4e50-a39b-891ba2be34c2	287b723f-85b1-4807-8302-be5a69d9fcd9	EMP-1781767763104	Roy	Demo	\N	1990-01-01	MALE	Malaysian	900101-14-1234	\N	roy+1781767762768@democorp.my	roy+1781767762768@democorp.my	+60123456789	\N	456 Home Street	Petaling Jaya	Selangor	46000	MY	\N	\N	\N	\N	HR Director	\N	\N	FULL_TIME	ACTIVE	2026-06-18	\N	\N	\N	30	\N	\N	\N	\N	Jane Demo	+60123456788	Spouse	\N	t	2026-06-18 07:29:23.106	2026-06-18 07:29:23.119
215c6592-b621-48d6-821c-d412f580a09a	19a8e217-533b-4237-856c-45d9e2ca4a3d	bd806eb9-311c-457a-8879-d4b1e4a40652	afedaadc-7dd6-4bda-b7c2-337216f32a45	EMP-1781768642152	Roy	Demo	\N	1990-01-01	MALE	Malaysian	900101-14-1234	\N	roy+1781768641509@democorp.my	roy+1781768641509@democorp.my	+60123456789	\N	456 Home Street	Petaling Jaya	Selangor	46000	MY	\N	\N	\N	\N	HR Director	\N	\N	FULL_TIME	ACTIVE	2026-06-18	\N	\N	\N	30	\N	\N	\N	\N	Jane Demo	+60123456788	Spouse	\N	t	2026-06-18 07:44:02.154	2026-06-18 07:44:02.189
67ec3eb0-13ff-4a28-9521-7062ed542778	9ecf7758-292c-48dc-98ba-89eea040da4a	8055fd88-7e75-421b-ba3c-5dc3f1d544d3	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	EMP-2026-00001	Roy	Demo	\N	1990-01-01	MALE	Malaysian	900101-14-1234	\N	roy+1781768782400@democorp.my	roy+1781768782400@democorp.my	+60123456789	\N	456 Home Street	Petaling Jaya	Selangor	46000	MY	\N	\N	\N	\N	HR Director	\N	\N	FULL_TIME	ACTIVE	2026-06-18	\N	\N	\N	30	\N	\N	\N	\N	Jane Demo	+60123456788	Spouse	\N	t	2026-06-18 07:46:23.593	2026-06-18 07:46:23.638
b54c4dd3-24ca-4f64-a5f6-fba63646ea03	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	EMP-001	Roy	Director	\N	1980-05-10	MALE	Malaysian	800510-14-1234	\N	roy.personal@example.com	roy@demo.hrmanager4u.ai	+60123456780	\N	123 Main Street	Kuala Lumpur	Kuala Lumpur	50000	MY	9c85e0c9-f975-4216-ac3f-805f63143fc8	\N	\N	\N	HR Director	\N	\N	FULL_TIME	ACTIVE	2020-01-01	\N	\N	\N	30	\N	\N	\N	\N	Jane Director	+60123456788	Spouse	\N	t	2026-06-18 08:30:30.197	2026-06-18 08:30:30.197
8b773a6e-947c-46a1-b6c5-75710bc1132c	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	07e8239b-809c-48f8-a656-b50b8af927ce	EMP-002	Alan	Manager	\N	1985-08-15	MALE	Malaysian	850815-14-2345	\N	alan.personal@example.com	manager@demo.hrmanager4u.ai	+60123456781	\N	456 Subang Jaya	Subang Jaya	Selangor	47500	MY	9c85e0c9-f975-4216-ac3f-805f63143fc8	\N	\N	b54c4dd3-24ca-4f64-a5f6-fba63646ea03	HR Manager	\N	\N	FULL_TIME	ACTIVE	2021-03-01	\N	\N	\N	30	\N	\N	\N	\N	Mrs Manager	+60123456789	Spouse	\N	t	2026-06-18 08:30:30.202	2026-06-18 08:30:30.202
86c83d65-b937-49f9-89c1-816eb294d9c0	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	EMP-003	Sarah	Lim	\N	1995-12-20	FEMALE	Malaysian	951220-14-3456	\N	sarah.personal@example.com	sarah@demo.hrmanager4u.ai	+60123456782	\N	789 Petaling Jaya	Petaling Jaya	Selangor	46000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	Software Engineer	\N	\N	FULL_TIME	ACTIVE	2023-06-15	\N	\N	\N	30	\N	\N	\N	\N	Mr Lim	+60123456790	Parent	\N	t	2026-06-18 08:30:30.212	2026-06-18 08:30:30.212
887f6d6d-1fa4-44cc-8453-d6a704933912	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	6f58ea0f-1bb2-4f68-a54c-df7d3b236a85	EMP-04	John	Tan	\N	1990-01-01	MALE	Malaysian	900101-14-5555	\N	john@example.com	john.tan@demo.hrmanager4u.ai	+60123456000	\N	120 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	QA Engineer	\N	\N	FULL_TIME	ACTIVE	2020-01-01	\N	\N	\N	30	\N	\N	\N	\N	Tan Contact	+60123459000	Sibling	\N	t	2026-06-18 08:30:30.264	2026-06-18 08:30:30.264
aa2e36de-2ace-4242-9cdf-de64d9a7be2b	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	56094541-3ae8-48ca-93b0-f06fc619fad4	EMP-05	David	Wong	\N	1990-01-01	MALE	Malaysian	920202-14-6666	\N	david@example.com	david.wong@demo.hrmanager4u.ai	+60123456001	\N	121 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	Frontend Dev	\N	\N	FULL_TIME	ACTIVE	2021-02-01	\N	\N	\N	30	\N	\N	\N	\N	Wong Contact	+60123459001	Sibling	\N	t	2026-06-18 08:30:30.302	2026-06-18 08:30:30.302
06499388-fefc-49ae-b0ce-a92c578af5ef	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	9664129f-4cd8-4561-8993-8241124e2000	EMP-06	Lisa	Ong	\N	1990-01-01	FEMALE	Malaysian	880303-14-7777	\N	lisa@example.com	lisa.ong@demo.hrmanager4u.ai	+60123456002	\N	122 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	Product Manager	\N	\N	FULL_TIME	ACTIVE	2022-03-01	\N	\N	\N	30	\N	\N	\N	\N	Ong Contact	+60123459002	Sibling	\N	t	2026-06-18 08:30:30.317	2026-06-18 08:30:30.317
7f9fa6a5-4291-4ea3-a879-431dac9a8c50	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	e6356c05-b27a-4f97-8e2a-afadbbe84cb5	EMP-07	Michael	Lee	\N	1990-01-01	MALE	Malaysian	940404-14-8888	\N	michael@example.com	michael.lee@demo.hrmanager4u.ai	+60123456003	\N	123 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	Backend Dev	\N	\N	FULL_TIME	ACTIVE	2023-04-01	\N	\N	\N	30	\N	\N	\N	\N	Lee Contact	+60123459003	Sibling	\N	t	2026-06-18 08:30:30.327	2026-06-18 08:30:30.327
c5a87327-7443-41d2-892e-60d2dbced86d	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	6d92ab16-6cbe-43cd-a3b4-df08bee05ff2	EMP-08	Rachel	Ng	\N	1990-01-01	FEMALE	Malaysian	960505-14-9999	\N	rachel@example.com	rachel.ng@demo.hrmanager4u.ai	+60123456004	\N	124 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	UX Designer	\N	\N	FULL_TIME	ACTIVE	2020-05-01	\N	\N	\N	30	\N	\N	\N	\N	Ng Contact	+60123459004	Sibling	\N	t	2026-06-18 08:30:30.335	2026-06-18 08:30:30.335
f707ddb1-21b9-48d6-89ce-ad28f15a9cca	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	a538f924-3d18-4bab-9546-909d084ce636	EMP-09	Kevin	Low	\N	1990-01-01	MALE	Malaysian	910606-14-0000	\N	kevin@example.com	kevin.low@demo.hrmanager4u.ai	+60123456005	\N	125 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	DevOps Engineer	\N	\N	FULL_TIME	ACTIVE	2021-06-01	\N	\N	\N	30	\N	\N	\N	\N	Low Contact	+60123459005	Sibling	\N	t	2026-06-18 08:30:30.373	2026-06-18 08:30:30.373
eb5f8b2e-0854-4eed-b7dc-f63637ec1399	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	64e4d5ab-9e95-4ea5-bc28-fedf7b24c68e	EMP-010	Farah	Ahmad	\N	1990-01-01	FEMALE	Malaysian	930707-14-1111	\N	farah@example.com	farah.ahmad@demo.hrmanager4u.ai	+60123456006	\N	126 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	Data Scientist	\N	\N	FULL_TIME	ACTIVE	2022-07-01	\N	\N	\N	30	\N	\N	\N	\N	Ahmad Contact	+60123459006	Sibling	\N	t	2026-06-18 08:30:30.383	2026-06-18 08:30:30.383
8d1ce7f0-6062-4a96-873e-d88bcba6a52a	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	a2428440-5d46-4704-beea-cc46eb75a420	EMP-011	Amir	Hassan	\N	1990-01-01	MALE	Malaysian	890808-14-2222	\N	amir@example.com	amir.hassan@demo.hrmanager4u.ai	+60123456007	\N	127 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	Business Analyst	\N	\N	FULL_TIME	ACTIVE	2023-08-01	\N	\N	\N	30	\N	\N	\N	\N	Hassan Contact	+60123459007	Sibling	\N	t	2026-06-18 08:30:30.39	2026-06-18 08:30:30.39
5b84082a-d4bd-476a-a635-f5b21b70d403	34d46238-f564-429f-95c6-8301ce538f29	6afe9526-77eb-4a4a-a7a7-b2369c0690c6	6bc46fa5-a960-4e9e-ae13-30f7f3f9c990	EMP-012	Priya	Kumar	\N	1990-01-01	FEMALE	Malaysian	970909-14-3333	\N	priya@example.com	priya.kumar@demo.hrmanager4u.ai	+60123456008	\N	128 Tech Street	Kuala Lumpur	Kuala Lumpur	50000	MY	6155b496-8024-4502-91cd-e50bed5ca586	\N	\N	8b773a6e-947c-46a1-b6c5-75710bc1132c	Support Engineer	\N	\N	FULL_TIME	ACTIVE	2020-09-01	\N	\N	\N	30	\N	\N	\N	\N	Kumar Contact	+60123459008	Sibling	\N	t	2026-06-18 08:30:30.396	2026-06-18 08:30:30.396
\.


--
-- Data for Name: handbook_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.handbook_policies (id, tenant_id, company_id, name, version, country, policies, status, handbook_url, code_of_conduct_url, published_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: knowledge_bases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knowledge_bases (id, tenant_id, name, description, type, country, jurisdiction, is_system_document, status, file_url, file_size, mime_type, page_count, chunk_count, error_message, processed_at, created_by, created_at, updated_at) FROM stdin;
59bbfd02-da08-4101-bbc1-49c224ea0e50	34d46238-f564-429f-95c6-8301ce538f29	Employment Act 1955	\N	EMPLOYMENT_ACT	MY	\N	f	READY	minio://hrmanager4u/Employment_Act_1955.pdf	1024000	application/pdf	50	150	\N	\N	\N	2026-06-18 08:30:30.576	2026-06-18 08:30:30.576
dea77ade-a197-4789-9cbe-2f3d74944276	34d46238-f564-429f-95c6-8301ce538f29	Industrial Relations Act 1967	\N	INDUSTRIAL_RELATIONS_ACT	MY	\N	f	READY	minio://hrmanager4u/Industrial_Relations_Act_1967.pdf	1024000	application/pdf	50	150	\N	\N	\N	2026-06-18 08:30:30.58	2026-06-18 08:30:30.58
347e35d8-6f3b-4c94-ae5b-0df6dfe6867d	34d46238-f564-429f-95c6-8301ce538f29	Employee Handbook	\N	COMPANY_HANDBOOK	MY	\N	f	READY	minio://hrmanager4u/Employee_Handbook.pdf	1024000	application/pdf	50	150	\N	\N	\N	2026-06-18 08:30:30.583	2026-06-18 08:30:30.583
f264b1bc-4939-4e82-9e9f-7919ddfe54c8	34d46238-f564-429f-95c6-8301ce538f29	Leave Policy	\N	CUSTOM	MY	\N	f	READY	minio://hrmanager4u/Leave_Policy.pdf	1024000	application/pdf	50	150	\N	\N	\N	2026-06-18 08:30:30.586	2026-06-18 08:30:30.586
3de34289-f2c7-4a90-b9c5-98145139c534	34d46238-f564-429f-95c6-8301ce538f29	Remote Work Policy	\N	CUSTOM	MY	\N	f	READY	minio://hrmanager4u/Remote_Work_Policy.pdf	1024000	application/pdf	50	150	\N	\N	\N	2026-06-18 08:30:30.591	2026-06-18 08:30:30.591
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_balances (id, tenant_id, employee_id, leave_type_id, year, total_days, taken_days, pending_days) FROM stdin;
62d4fbd0-e1ee-40d7-a295-2e6d115be05a	9ecf7758-292c-48dc-98ba-89eea040da4a	67ec3eb0-13ff-4a28-9521-7062ed542778	95165359-7814-4cff-8663-6c3fef13ba90	2026	14.00	2.00	0.00
f20de936-24b3-4ecb-87c1-966931173f23	34d46238-f564-429f-95c6-8301ce538f29	b54c4dd3-24ca-4f64-a5f6-fba63646ea03	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
154c7b6a-5652-428a-84e1-7033a4c1d5a2	34d46238-f564-429f-95c6-8301ce538f29	b54c4dd3-24ca-4f64-a5f6-fba63646ea03	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
81f48024-0a6d-41a2-b2e7-069fbf954ad3	34d46238-f564-429f-95c6-8301ce538f29	8b773a6e-947c-46a1-b6c5-75710bc1132c	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
51084c3f-0762-46e3-971b-d4ecc6e56323	34d46238-f564-429f-95c6-8301ce538f29	8b773a6e-947c-46a1-b6c5-75710bc1132c	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
41c2dd03-d521-41a2-aa5e-67f189780ac2	34d46238-f564-429f-95c6-8301ce538f29	86c83d65-b937-49f9-89c1-816eb294d9c0	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	2.00	1.00
68deb0d7-4871-4c14-8b71-8f477109c66a	34d46238-f564-429f-95c6-8301ce538f29	86c83d65-b937-49f9-89c1-816eb294d9c0	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
a72991e1-5fee-43a2-b76c-15130aa744d3	34d46238-f564-429f-95c6-8301ce538f29	887f6d6d-1fa4-44cc-8453-d6a704933912	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
885bc36c-3f66-445d-8605-5553dbcca43c	34d46238-f564-429f-95c6-8301ce538f29	887f6d6d-1fa4-44cc-8453-d6a704933912	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
baad5048-8412-4762-b7b9-aceb47ec85da	34d46238-f564-429f-95c6-8301ce538f29	aa2e36de-2ace-4242-9cdf-de64d9a7be2b	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
137a0100-4236-4468-852f-6efeea851b1e	34d46238-f564-429f-95c6-8301ce538f29	aa2e36de-2ace-4242-9cdf-de64d9a7be2b	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
fcdc133f-2543-410f-8441-decacadefcaa	34d46238-f564-429f-95c6-8301ce538f29	06499388-fefc-49ae-b0ce-a92c578af5ef	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
ab2be6cb-8d84-4ff4-86f4-1a5a1a2e421e	34d46238-f564-429f-95c6-8301ce538f29	06499388-fefc-49ae-b0ce-a92c578af5ef	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
c5f76edf-b76f-4be7-b673-6ef3c6b4e3e4	34d46238-f564-429f-95c6-8301ce538f29	7f9fa6a5-4291-4ea3-a879-431dac9a8c50	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
6123cdf5-cd07-4dfb-be1d-741606f40866	34d46238-f564-429f-95c6-8301ce538f29	7f9fa6a5-4291-4ea3-a879-431dac9a8c50	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
423a04c8-26e7-4101-a8d0-d6db12ddafa5	34d46238-f564-429f-95c6-8301ce538f29	c5a87327-7443-41d2-892e-60d2dbced86d	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
99785cb0-aeb4-4434-822b-2b9bab15c300	34d46238-f564-429f-95c6-8301ce538f29	c5a87327-7443-41d2-892e-60d2dbced86d	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
ec1aa382-5a0a-4660-9123-11546dd0a929	34d46238-f564-429f-95c6-8301ce538f29	f707ddb1-21b9-48d6-89ce-ad28f15a9cca	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
d94d297c-b063-4140-9b06-f973e16aaebb	34d46238-f564-429f-95c6-8301ce538f29	f707ddb1-21b9-48d6-89ce-ad28f15a9cca	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
ecc6a0d4-97eb-4460-b238-1c16ca7c4f89	34d46238-f564-429f-95c6-8301ce538f29	eb5f8b2e-0854-4eed-b7dc-f63637ec1399	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
0e418b2d-a81f-44a5-80fa-4d1c11ee40ee	34d46238-f564-429f-95c6-8301ce538f29	eb5f8b2e-0854-4eed-b7dc-f63637ec1399	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
af7b6afa-1b30-49d6-b5e6-7616b4149fbf	34d46238-f564-429f-95c6-8301ce538f29	8d1ce7f0-6062-4a96-873e-d88bcba6a52a	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
bbb285e7-4098-4734-ac40-e16f74e07249	34d46238-f564-429f-95c6-8301ce538f29	8d1ce7f0-6062-4a96-873e-d88bcba6a52a	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
e7d3c6ed-429f-4012-a51b-ce28f8c610bf	34d46238-f564-429f-95c6-8301ce538f29	5b84082a-d4bd-476a-a635-f5b21b70d403	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026	14.00	0.00	0.00
0ed4069f-58a0-4d58-be65-d1d15d47c221	34d46238-f564-429f-95c6-8301ce538f29	5b84082a-d4bd-476a-a635-f5b21b70d403	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026	14.00	0.00	0.00
d36a49c8-b2b8-49bf-913a-71039754c78d	34d46238-f564-429f-95c6-8301ce538f29	86c83d65-b937-49f9-89c1-816eb294d9c0	2d92d234-302c-4a62-82d8-79279705ddc3	2026	14.00	0.00	3.00
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, tenant_id, employee_id, leave_type_id, start_date, end_date, days, reason, status, manager_id, reviewed_at, created_at, updated_at) FROM stdin;
8963966e-7313-45c3-9c5a-7df4791b31ad	9ecf7758-292c-48dc-98ba-89eea040da4a	67ec3eb0-13ff-4a28-9521-7062ed542778	95165359-7814-4cff-8663-6c3fef13ba90	2026-06-18	2026-06-20	2.00	Vacation	APPROVED	\N	2026-06-18 07:46:23.757	2026-06-18 07:46:23.728	2026-06-18 07:46:23.759
98024940-2c06-436d-9161-5ba8d27220b2	34d46238-f564-429f-95c6-8301ce538f29	86c83d65-b937-49f9-89c1-816eb294d9c0	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026-05-10	2026-05-11	2.00	Family trip	APPROVED	8b773a6e-947c-46a1-b6c5-75710bc1132c	2026-05-01 00:00:00	2026-06-18 08:30:30.553	2026-06-18 08:30:30.553
2f1dc933-2735-4e53-838a-c8cb087e573e	34d46238-f564-429f-95c6-8301ce538f29	887f6d6d-1fa4-44cc-8453-d6a704933912	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026-06-01	2026-06-01	1.00	Personal errands	APPROVED	8b773a6e-947c-46a1-b6c5-75710bc1132c	2026-05-15 00:00:00	2026-06-18 08:30:30.556	2026-06-18 08:30:30.556
59c3f778-f263-4f7f-803b-5ee6f4ce60e7	34d46238-f564-429f-95c6-8301ce538f29	aa2e36de-2ace-4242-9cdf-de64d9a7be2b	301c9c10-10c1-4a3e-b371-f9fdcd965624	2026-04-10	2026-04-11	2.00	Fever	APPROVED	8b773a6e-947c-46a1-b6c5-75710bc1132c	2026-04-10 00:00:00	2026-06-18 08:30:30.559	2026-06-18 08:30:30.559
dc382b73-45ff-40aa-a1ea-601009768d15	34d46238-f564-429f-95c6-8301ce538f29	86c83d65-b937-49f9-89c1-816eb294d9c0	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026-07-01	2026-07-01	1.00	Attending wedding	PENDING	\N	\N	2026-06-18 08:30:30.561	2026-06-18 08:30:30.561
4b873ec6-8e3a-47e8-9871-9eb76d6792c6	34d46238-f564-429f-95c6-8301ce538f29	06499388-fefc-49ae-b0ce-a92c578af5ef	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026-07-15	2026-07-16	2.00	Vacation	PENDING	\N	\N	2026-06-18 08:30:30.566	2026-06-18 08:30:30.566
3488da96-4c61-45cb-81db-e2470ca5b1ab	34d46238-f564-429f-95c6-8301ce538f29	7f9fa6a5-4291-4ea3-a879-431dac9a8c50	0327e3f2-3ccb-4042-88ea-d92f2b483b90	2026-03-01	2026-03-14	14.00	Long holiday	REJECTED	8b773a6e-947c-46a1-b6c5-75710bc1132c	2026-02-15 00:00:00	2026-06-18 08:30:30.568	2026-06-18 08:30:30.568
b68db779-73e0-4d17-af03-5d7f69180d8b	34d46238-f564-429f-95c6-8301ce538f29	86c83d65-b937-49f9-89c1-816eb294d9c0	2d92d234-302c-4a62-82d8-79279705ddc3	2026-08-01	2026-08-01	1.00	Personal reason	PENDING	8b773a6e-947c-46a1-b6c5-75710bc1132c	\N	2026-06-18 08:39:49.767	2026-06-18 08:39:49.767
b59a8a0d-13de-48cf-814f-ca9d9faff17e	34d46238-f564-429f-95c6-8301ce538f29	86c83d65-b937-49f9-89c1-816eb294d9c0	2d92d234-302c-4a62-82d8-79279705ddc3	2026-08-01	2026-08-01	1.00	Personal reason	PENDING	8b773a6e-947c-46a1-b6c5-75710bc1132c	\N	2026-06-18 08:40:25.904	2026-06-18 08:40:25.904
3f8e0c98-8886-4940-ae44-ec6d116a14c6	34d46238-f564-429f-95c6-8301ce538f29	86c83d65-b937-49f9-89c1-816eb294d9c0	2d92d234-302c-4a62-82d8-79279705ddc3	2026-08-01	2026-08-01	1.00	Personal reason	PENDING	8b773a6e-947c-46a1-b6c5-75710bc1132c	\N	2026-06-18 08:40:53.446	2026-06-18 08:40:53.446
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_types (id, tenant_id, name, description, is_paid, default_days, created_at, updated_at) FROM stdin;
2d92d234-302c-4a62-82d8-79279705ddc3	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	Annual Leave	\N	t	14	2026-06-18 07:29:23.127	2026-06-18 07:29:23.127
a26d9191-ee80-4087-83b7-bd28cc624b87	19a8e217-533b-4237-856c-45d9e2ca4a3d	Annual Leave	\N	t	14	2026-06-18 07:44:02.209	2026-06-18 07:44:02.209
efc30e9a-c1d8-4f5d-9ee8-4517257a68b2	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	Annual Leave	\N	t	14	2026-06-18 07:45:20.932	2026-06-18 07:45:20.932
95165359-7814-4cff-8663-6c3fef13ba90	9ecf7758-292c-48dc-98ba-89eea040da4a	Annual Leave	\N	t	14	2026-06-18 07:46:23.573	2026-06-18 07:46:23.573
0327e3f2-3ccb-4042-88ea-d92f2b483b90	34d46238-f564-429f-95c6-8301ce538f29	Annual Leave	\N	t	14	2026-06-18 08:30:30.401	2026-06-18 08:30:30.401
301c9c10-10c1-4a3e-b371-f9fdcd965624	34d46238-f564-429f-95c6-8301ce538f29	Sick Leave	\N	t	14	2026-06-18 08:30:30.41	2026-06-18 08:30:30.41
\.


--
-- Data for Name: lifecycle_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lifecycle_events (id, tenant_id, employee_id, previous_status, new_status, effective_date, reason, changed_by, created_at) FROM stdin;
7b3dac5c-b78c-4e15-b630-fef07f4a764a	27264cbd-ae9d-4ea4-bfea-026953022ced	b8d9d4ec-0a46-48e4-859b-946e48accfc4	PROBATION	ACTIVE	2026-06-18	Passed probation	8c74ec98-6f6e-41b5-bda6-192541d19233	2026-06-18 07:00:20.536
cb9d89d1-c5d5-434f-bf5b-03f96e9086d5	f70e4da0-e903-4352-b249-33d70013f09c	3faae3ef-9225-41b8-9456-478c81e3c17d	PROBATION	ACTIVE	2026-06-18	Passed probation	71a2d99b-4788-4bfb-b355-d8ad2ec17f7c	2026-06-18 07:28:59.579
ef691831-c625-4305-a549-48614b46d4ae	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	c0622bc0-df90-4f61-b7e8-a76fa30d0028	PROBATION	ACTIVE	2026-06-18	Passed probation	287b723f-85b1-4807-8302-be5a69d9fcd9	2026-06-18 07:29:23.123
67cf726c-80f5-49e0-b4f8-061de050e6a7	19a8e217-533b-4237-856c-45d9e2ca4a3d	215c6592-b621-48d6-821c-d412f580a09a	PROBATION	ACTIVE	2026-06-18	Passed probation	afedaadc-7dd6-4bda-b7c2-337216f32a45	2026-06-18 07:44:02.195
0493b83e-cd45-499f-88be-11b6db6e325e	9ecf7758-292c-48dc-98ba-89eea040da4a	67ec3eb0-13ff-4a28-9521-7062ed542778	PROBATION	ACTIVE	2026-06-18	Passed probation	4a0bcb86-4b7a-49d9-a558-2f1e77b21405	2026-06-18 07:46:23.649
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_logs (id, tenant_id, user_id, channel, type, status, error, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, tenant_id, type, channel, content, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, role, resource, action) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, tenant_id, refresh_token, device_info, ip_address, expires_at, revoked_at, created_at) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, tenant_id, department_id, name, manager_id, budget, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, slug, plan, country, is_active, settings, created_at, updated_at) FROM stdin;
5c8ccc82-eb63-47a9-bd13-90b2a793a285	Demo Corp	demo-corp-gnwmku	TRIAL	MY	t	\N	2026-06-18 06:56:53.159	2026-06-18 06:56:53.159
b216cce6-2045-44f3-ba0b-039f1e71bc9f	Demo Corp	demo-corp-4azlyf	TRIAL	MY	t	\N	2026-06-18 06:57:09.779	2026-06-18 06:57:09.779
1d34ba2a-c56a-4357-83c4-0649fd7843c1	Demo Corp	demo-corp-ia45yw	TRIAL	MY	t	\N	2026-06-18 06:58:10.728	2026-06-18 06:58:10.728
a6c4eeea-cdfa-4985-95cb-6946bd5abc13	Demo Corp	demo-corp-u71auy	TRIAL	MY	t	\N	2026-06-18 06:58:59.852	2026-06-18 06:58:59.852
27264cbd-ae9d-4ea4-bfea-026953022ced	Demo Corp	demo-corp-vbh2yt	TRIAL	MY	t	\N	2026-06-18 07:00:20.226	2026-06-18 07:00:20.226
f70e4da0-e903-4352-b249-33d70013f09c	Demo Corp	demo-corp-xmin6e	TRIAL	MY	t	\N	2026-06-18 07:28:59.219	2026-06-18 07:28:59.219
a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	Demo Corp	demo-corp-7iqh03	TRIAL	MY	t	\N	2026-06-18 07:29:22.916	2026-06-18 07:29:22.916
dfb5a372-779a-49af-90a9-fc7ad3b899ba	Hacker	hacker-bxeia1	TRIAL	MY	t	\N	2026-06-18 07:29:25	2026-06-18 07:29:25
19a8e217-533b-4237-856c-45d9e2ca4a3d	Demo Corp	demo-corp-n8adfw	TRIAL	MY	t	\N	2026-06-18 07:44:01.716	2026-06-18 07:44:01.716
96f61e58-870c-41a9-bd41-9ff040db14b3	Hacker	hacker-b0gjod	TRIAL	MY	t	\N	2026-06-18 07:44:05.59	2026-06-18 07:44:05.59
34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	Demo Corp	demo-corp-gw355o	TRIAL	MY	t	\N	2026-06-18 07:45:20.732	2026-06-18 07:45:20.732
11e7805e-a79b-4b31-8a7c-b3573bac6e82	Hacker	hacker-3swvyf	TRIAL	MY	t	\N	2026-06-18 07:45:24.917	2026-06-18 07:45:24.917
9ecf7758-292c-48dc-98ba-89eea040da4a	Demo Corp	demo-corp-0r487h	TRIAL	MY	t	\N	2026-06-18 07:46:22.861	2026-06-18 07:46:22.861
c4061e22-3f29-44bc-8c85-b8fede14f35d	Hacker	hacker-ujh9nc	TRIAL	MY	t	\N	2026-06-18 07:46:27.931	2026-06-18 07:46:27.931
34d46238-f564-429f-95c6-8301ce538f29	Tech Innovators Sdn Bhd	tech-innovators	ENTERPRISE	MY	t	\N	2026-06-18 08:30:30.142	2026-06-18 08:30:30.142
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, tenant_id, email, password_hash, role, first_name, last_name, phone, is_active, mfa_enabled, mfa_secret, email_verified, last_login_at, password_reset_token, password_reset_expiry, created_at, updated_at) FROM stdin;
41312bdf-68e5-41e7-872c-0475fca75298	5c8ccc82-eb63-47a9-bd13-90b2a793a285	roy+1781765812900@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$knIB244S+J1gJfNVm0Udig$mUi01oKplLZrPbAK/8W4HnUowLadpH4iWCKC/dvoPTg	COMPANY_ADMIN	Roy	Demo	\N	t	f	\N	f	2026-06-18 06:56:53.32	\N	\N	2026-06-18 06:56:53.165	2026-06-18 06:56:53.323
5df059fc-3f78-4202-af4e-1232ae27915e	b216cce6-2045-44f3-ba0b-039f1e71bc9f	roy+1781765829608@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$+m/+giuOOkODVeAf67kzuQ$GZ2RzA2KAyMcdEBoljU+pramps3gqANX147ymyJXYpk	COMPANY_ADMIN	Roy	Demo	\N	t	f	\N	f	2026-06-18 06:57:09.907	\N	\N	2026-06-18 06:57:09.783	2026-06-18 06:57:09.909
9f4abd35-38ed-45e5-97ac-b4dff28395cf	1d34ba2a-c56a-4357-83c4-0649fd7843c1	roy+1781765890605@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$Tjo//AxdA0B+1lBW62KBqQ$15TXM34U2LHrprJSn6T06ERWJAbv/lfPjkYKiK4ReSg	COMPANY_ADMIN	Roy	Demo	\N	t	f	\N	f	2026-06-18 06:58:10.822	\N	\N	2026-06-18 06:58:10.731	2026-06-18 06:58:10.824
e5f349b1-de2a-4308-ae55-e9315354504a	a6c4eeea-cdfa-4985-95cb-6946bd5abc13	roy+1781765939706@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$TTCCJ90yyj6uK0yJa73nEQ$KObXfjEcZjN66TXjzlYhuQBgLHklY0y+T+V5rpYkngY	COMPANY_ADMIN	Roy	Demo	\N	t	f	\N	f	2026-06-18 06:58:59.976	\N	\N	2026-06-18 06:58:59.854	2026-06-18 06:58:59.981
8c74ec98-6f6e-41b5-bda6-192541d19233	27264cbd-ae9d-4ea4-bfea-026953022ced	roy+1781766019951@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$YosDbMMl2aIHZBVwIJ5r7w$Ewze1CP0K7qgPAH1V1C0jfTOJ19HsfDIKk7etDDoIy0	COMPANY_ADMIN	Roy	Demo	\N	t	f	\N	f	2026-06-18 07:00:20.351	\N	\N	2026-06-18 07:00:20.231	2026-06-18 07:00:20.353
71a2d99b-4788-4bfb-b355-d8ad2ec17f7c	f70e4da0-e903-4352-b249-33d70013f09c	roy+1781767739013@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$q+yzrRa9NziUGgEHRdtwLQ$1H7VnEzPvTo6JVtmVvhmjyw8mz0jBlyvQp1k/9KYnq0	COMPANY_ADMIN	Roy	Demo	\N	t	f	\N	f	2026-06-18 07:28:59.329	\N	\N	2026-06-18 07:28:59.223	2026-06-18 07:28:59.33
287b723f-85b1-4807-8302-be5a69d9fcd9	a88ac64b-fbd2-41f6-8f7a-250c9fd5e288	roy+1781767762768@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$fBUoSxy+wY9dpEA1+elohA$6wdwRE0aI4BKxFf4Kdef7Jd9AwVfwT23tEjWmSSDJOM	COMPANY_ADMIN	Roy	Demo	\N	t	f	\N	f	2026-06-18 07:29:23	\N	\N	2026-06-18 07:29:22.918	2026-06-18 07:29:23.001
def43404-6c88-4050-9a06-fd3631d8e9e7	dfb5a372-779a-49af-90a9-fc7ad3b899ba	hacker+1781767764921@hacker.my	$argon2id$v=19$m=65536,t=3,p=4$5NoFp0iXZhlsoCN8hZ4nEg$CRx4WcgJdE4Ea9sTNIuPkv9S3LCjgRRrE/gnXJHn1TM	COMPANY_ADMIN	H	A	\N	t	f	\N	f	2026-06-18 07:29:25.075	\N	\N	2026-06-18 07:29:25.002	2026-06-18 07:29:25.077
a3d5f0b0-3439-403a-8fd4-77fec0a50f3d	11e7805e-a79b-4b31-8a7c-b3573bac6e82	hacker+1781768724839@hacker.my	$argon2id$v=19$m=65536,t=3,p=4$VMBBk/ovW5eEYoM/9wmwWw$l3KP7nXEc4+EiX/ea4DfBtBq6p0xJzZhyJi+FPvltfI	COMPANY_ADMIN	H	A	\N	t	f	\N	f	2026-06-18 07:45:24.986	\N	\N	2026-06-18 07:45:24.919	2026-06-18 07:45:24.988
afedaadc-7dd6-4bda-b7c2-337216f32a45	19a8e217-533b-4237-856c-45d9e2ca4a3d	roy+1781768641509@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$OJJHlc57Ubanj7mRv3tUiw$0T2sKt4A0or2Qiq/I+Bxw19SuMbW4ajPZv4oiGUfE3A	COMPANY_ADMIN	Roy	Demo	\N	t	f	RBJSKHGQT2TZKOQUTDQWI5JOCYKBSCGN	f	2026-06-18 07:44:01.835	4d64713d550da1455d1ee69b2416f9572306110abdefc23f44549ddad463cf8b	2026-06-18 08:44:02.011	2026-06-18 07:44:01.721	2026-06-18 07:44:02.011
d66eb176-75cf-471a-a7b0-c0732ca4c549	96f61e58-870c-41a9-bd41-9ff040db14b3	hacker+1781768645504@hacker.my	$argon2id$v=19$m=65536,t=3,p=4$QVftCWDbI6MzFkThPjpV/Q$ZuyQZ6cf/bIbyFS6ednIrLE/AcryQ+NikgJpi7SM0y4	COMPANY_ADMIN	H	A	\N	t	f	\N	f	2026-06-18 07:44:05.67	\N	\N	2026-06-18 07:44:05.593	2026-06-18 07:44:05.671
6f272fcb-169c-4bb7-a8f2-687a1cedf0c8	34d46238-f564-429f-95c6-8301ce538f29	sarah@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	Sarah	Lim	\N	t	f	\N	t	2026-06-18 09:57:32.514	\N	\N	2026-06-18 08:30:30.188	2026-06-18 09:57:32.516
10f3962d-335e-422c-a7ad-99db8ef5e7a5	34e4fc5d-dd5c-44d4-81e0-2c23bf7c59cc	roy+1781768720597@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$vSl5hKps6WvQaeDyHHm/mQ$XJKRGAxXvwlQvDRl/pwsWTMvb1IPCJeEBQoPwRxW3wA	COMPANY_ADMIN	Roy	Demo	\N	t	f	WQ5FD4FZURWV75LMQTCUACYRVF5GGSLV	f	2026-06-18 07:45:20.823	286d28665c01c5150faf5c14a25997aa7e6f93d7d4bd8f5ff1240bbf92dfc18c	2026-06-18 08:45:20.884	2026-06-18 07:45:20.734	2026-06-18 07:45:20.885
07e8239b-809c-48f8-a656-b50b8af927ce	34d46238-f564-429f-95c6-8301ce538f29	manager@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	HR_MANAGER	Alan	Manager	\N	t	f	\N	t	2026-06-18 09:57:32.582	\N	\N	2026-06-18 08:30:30.186	2026-06-18 09:57:32.583
4a0bcb86-4b7a-49d9-a558-2f1e77b21405	9ecf7758-292c-48dc-98ba-89eea040da4a	roy+1781768782400@democorp.my	$argon2id$v=19$m=65536,t=3,p=4$dl4rV/FM8NXfY33KaHkZrw$tISpI22NArhy2MVoflKffNN1SiOCTJllCCrmlDaRrFY	COMPANY_ADMIN	Roy	Demo	\N	t	f	A2CXWV24YJLDG7SWGWZ732EIA3ANNAA5	f	2026-06-18 07:46:23.098	601180a40a2837a6c9bc4b75fea4daca8be5cc04760a6fb080dd65610a83b04f	2026-06-18 08:46:23.418	2026-06-18 07:46:22.866	2026-06-18 07:46:23.42
83a0e027-b041-413c-8d5f-bff389c9bf78	c4061e22-3f29-44bc-8c85-b8fede14f35d	hacker+1781768787766@hacker.my	$argon2id$v=19$m=65536,t=3,p=4$uUvItxtemdSiinzmVLuWvw$6K/fCQocijmtYQ7ORoa5c8z8FpKt2MzBVlz9m3kXVaM	COMPANY_ADMIN	H	A	\N	t	f	\N	f	2026-06-18 07:46:28.03	\N	\N	2026-06-18 07:46:27.934	2026-06-18 07:46:28.032
6f58ea0f-1bb2-4f68-a54c-df7d3b236a85	34d46238-f564-429f-95c6-8301ce538f29	john.tan@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	John	Tan	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.216	2026-06-18 08:30:30.216
56094541-3ae8-48ca-93b0-f06fc619fad4	34d46238-f564-429f-95c6-8301ce538f29	david.wong@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	David	Wong	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.291	2026-06-18 08:30:30.291
9664129f-4cd8-4561-8993-8241124e2000	34d46238-f564-429f-95c6-8301ce538f29	lisa.ong@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	Lisa	Ong	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.31	2026-06-18 08:30:30.31
e6356c05-b27a-4f97-8e2a-afadbbe84cb5	34d46238-f564-429f-95c6-8301ce538f29	michael.lee@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	Michael	Lee	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.321	2026-06-18 08:30:30.321
6d92ab16-6cbe-43cd-a3b4-df08bee05ff2	34d46238-f564-429f-95c6-8301ce538f29	rachel.ng@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	Rachel	Ng	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.332	2026-06-18 08:30:30.332
a538f924-3d18-4bab-9546-909d084ce636	34d46238-f564-429f-95c6-8301ce538f29	kevin.low@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	Kevin	Low	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.362	2026-06-18 08:30:30.362
64e4d5ab-9e95-4ea5-bc28-fedf7b24c68e	34d46238-f564-429f-95c6-8301ce538f29	farah.ahmad@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	Farah	Ahmad	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.379	2026-06-18 08:30:30.379
a2428440-5d46-4704-beea-cc46eb75a420	34d46238-f564-429f-95c6-8301ce538f29	amir.hassan@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	Amir	Hassan	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.387	2026-06-18 08:30:30.387
6bc46fa5-a960-4e9e-ae13-30f7f3f9c990	34d46238-f564-429f-95c6-8301ce538f29	priya.kumar@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	EMPLOYEE	Priya	Kumar	\N	t	f	\N	t	\N	\N	\N	2026-06-18 08:30:30.394	2026-06-18 08:30:30.394
9c9aa5e5-62eb-4b4d-909c-ff47a54cea44	34d46238-f564-429f-95c6-8301ce538f29	roy@demo.hrmanager4u.ai	$argon2id$v=19$m=65536,t=3,p=4$LvD7B3LmllZEQbMTdhhYPw$dnI3RrEgd16v5pZwi1Cn8Xs360ElJzdUdPAWvrqR4OU	COMPANY_ADMIN	Roy	Director	\N	t	f	\N	t	2026-06-18 09:57:32.39	\N	\N	2026-06-18 08:30:30.182	2026-06-18 09:57:32.396
\.


--
-- Data for Name: workflow_instances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_instances (id, tenant_id, template_id, status, current_level, target_resource, target_id, requester_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workflow_step_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_step_logs (id, instance_id, level, status, approver_id, comments, action_at) FROM stdin;
\.


--
-- Data for Name: workflow_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_templates (id, tenant_id, type, name, steps, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ai_conversations ai_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_pkey PRIMARY KEY (id);


--
-- Name: ai_messages ai_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: compliance_records compliance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compliance_records
    ADD CONSTRAINT compliance_records_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: document_chunks document_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employee_files employee_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_files
    ADD CONSTRAINT employee_files_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: handbook_policies handbook_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.handbook_policies
    ADD CONSTRAINT handbook_policies_pkey PRIMARY KEY (id);


--
-- Name: knowledge_bases knowledge_bases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_bases
    ADD CONSTRAINT knowledge_bases_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: lifecycle_events lifecycle_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lifecycle_events
    ADD CONSTRAINT lifecycle_events_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflow_instances workflow_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_pkey PRIMARY KEY (id);


--
-- Name: workflow_step_logs workflow_step_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_step_logs
    ADD CONSTRAINT workflow_step_logs_pkey PRIMARY KEY (id);


--
-- Name: workflow_templates workflow_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_templates
    ADD CONSTRAINT workflow_templates_pkey PRIMARY KEY (id);


--
-- Name: ai_conversations_tenant_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_conversations_tenant_user_idx ON public.ai_conversations USING btree (tenant_id, user_id);


--
-- Name: ai_messages_conversation_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_messages_conversation_id_idx ON public.ai_messages USING btree (conversation_id);


--
-- Name: audit_logs_resource_resource_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_resource_resource_id_idx ON public.audit_logs USING btree (resource, resource_id);


--
-- Name: audit_logs_tenant_timestamp_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_tenant_timestamp_idx ON public.audit_logs USING btree (tenant_id, "timestamp");


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: branches_tenant_company_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX branches_tenant_company_idx ON public.branches USING btree (tenant_id, company_id);


--
-- Name: companies_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX companies_slug_key ON public.companies USING btree (slug);


--
-- Name: companies_tenant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_tenant_id_idx ON public.companies USING btree (tenant_id);


--
-- Name: compliance_records_tenant_company_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compliance_records_tenant_company_idx ON public.compliance_records USING btree (tenant_id, company_id);


--
-- Name: contracts_tenant_employee_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_tenant_employee_idx ON public.contracts USING btree (tenant_id, employee_id);


--
-- Name: departments_tenant_company_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX departments_tenant_company_idx ON public.departments USING btree (tenant_id, company_id);


--
-- Name: document_chunks_knowledge_base_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX document_chunks_knowledge_base_id_idx ON public.document_chunks USING btree (knowledge_base_id);


--
-- Name: document_chunks_tenant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX document_chunks_tenant_id_idx ON public.document_chunks USING btree (tenant_id);


--
-- Name: document_templates_tenant_type_version_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX document_templates_tenant_type_version_unique ON public.document_templates USING btree (tenant_id, type, version);


--
-- Name: documents_tenant_company_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_tenant_company_idx ON public.documents USING btree (tenant_id, company_id);


--
-- Name: documents_tenant_employee_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_tenant_employee_idx ON public.documents USING btree (tenant_id, employee_id);


--
-- Name: employee_files_tenant_employee_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employee_files_tenant_employee_idx ON public.employee_files USING btree (tenant_id, employee_id);


--
-- Name: employees_tenant_company_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employees_tenant_company_idx ON public.employees USING btree (tenant_id, company_id);


--
-- Name: employees_tenant_employee_number_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employees_tenant_employee_number_unique ON public.employees USING btree (tenant_id, employee_number);


--
-- Name: employees_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employees_user_id_key ON public.employees USING btree (user_id);


--
-- Name: handbook_policies_tenant_company_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX handbook_policies_tenant_company_idx ON public.handbook_policies USING btree (tenant_id, company_id);


--
-- Name: knowledge_bases_tenant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX knowledge_bases_tenant_id_idx ON public.knowledge_bases USING btree (tenant_id);


--
-- Name: knowledge_bases_type_country_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX knowledge_bases_type_country_idx ON public.knowledge_bases USING btree (type, country);


--
-- Name: leave_balances_employee_type_year_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX leave_balances_employee_type_year_unique ON public.leave_balances USING btree (employee_id, leave_type_id, year);


--
-- Name: leave_balances_tenant_employee_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX leave_balances_tenant_employee_idx ON public.leave_balances USING btree (tenant_id, employee_id);


--
-- Name: leave_requests_manager_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX leave_requests_manager_status_idx ON public.leave_requests USING btree (manager_id, status);


--
-- Name: leave_requests_tenant_employee_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX leave_requests_tenant_employee_idx ON public.leave_requests USING btree (tenant_id, employee_id);


--
-- Name: leave_types_tenant_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX leave_types_tenant_idx ON public.leave_types USING btree (tenant_id);


--
-- Name: lifecycle_events_tenant_employee_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lifecycle_events_tenant_employee_idx ON public.lifecycle_events USING btree (tenant_id, employee_id);


--
-- Name: notification_logs_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notification_logs_status_idx ON public.notification_logs USING btree (status);


--
-- Name: notification_logs_tenant_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notification_logs_tenant_user_idx ON public.notification_logs USING btree (tenant_id, user_id);


--
-- Name: notification_templates_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX notification_templates_unique ON public.notification_templates USING btree (tenant_id, type, channel);


--
-- Name: permissions_role_resource_action_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_role_resource_action_unique ON public.permissions USING btree (role, resource, action);


--
-- Name: sessions_refresh_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_refresh_token_idx ON public.sessions USING btree (refresh_token);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- Name: teams_tenant_department_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX teams_tenant_department_idx ON public.teams USING btree (tenant_id, department_id);


--
-- Name: tenants_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_slug_key ON public.tenants USING btree (slug);


--
-- Name: users_tenant_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_tenant_email_unique ON public.users USING btree (tenant_id, email);


--
-- Name: users_tenant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_tenant_id_idx ON public.users USING btree (tenant_id);


--
-- Name: workflow_instances_target_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX workflow_instances_target_idx ON public.workflow_instances USING btree (tenant_id, target_resource, target_id);


--
-- Name: workflow_step_logs_instance_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX workflow_step_logs_instance_idx ON public.workflow_step_logs USING btree (instance_id);


--
-- Name: workflow_templates_tenant_type_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX workflow_templates_tenant_type_unique ON public.workflow_templates USING btree (tenant_id, type);


--
-- Name: ai_messages ai_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: branches branches_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: companies companies_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: compliance_records compliance_records_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compliance_records
    ADD CONSTRAINT compliance_records_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contracts contracts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contracts contracts_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: departments departments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: departments departments_parent_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_department_id_fkey FOREIGN KEY (parent_department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: document_chunks document_chunks_knowledge_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_knowledge_base_id_fkey FOREIGN KEY (knowledge_base_id) REFERENCES public.knowledge_bases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_files employee_files_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_files
    ADD CONSTRAINT employee_files_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: handbook_policies handbook_policies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.handbook_policies
    ADD CONSTRAINT handbook_policies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: knowledge_bases knowledge_bases_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_bases
    ADD CONSTRAINT knowledge_bases_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_balances leave_balances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_balances leave_balances_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_types leave_types_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lifecycle_events lifecycle_events_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lifecycle_events
    ADD CONSTRAINT lifecycle_events_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teams teams_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_instances workflow_instances_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.workflow_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_step_logs workflow_step_logs_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_step_logs
    ADD CONSTRAINT workflow_step_logs_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.workflow_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

