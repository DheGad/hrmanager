-- =============================================================================
-- HRManager4U.ai — PostgreSQL Initialization Script
-- Run on first startup to set up extensions and audit table constraints
-- =============================================================================

-- Enable pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable btree_gin for composite indexes
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Set timezone
SET timezone = 'UTC';

-- Create audit_logs role with INSERT-only permissions (immutable audit trail)
-- This role is used by the app for audit logging — cannot UPDATE or DELETE
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'audit_writer') THEN
    CREATE ROLE audit_writer;
  END IF;
END
$$;
