#!/usr/bin/env bash
# =============================================================================
# HRManager4U.ai — Restore Script
# Restores PostgreSQL from backup and re-syncs MinIO
# =============================================================================

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-hrmanager}"
DB_NAME="${DB_NAME:-hrmanager4u}"
BACKUP_FILE="${1:-}"
MINIO_ALIAS="${MINIO_ALIAS:-minio}"
MINIO_BACKUP="${2:-}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [RESTORE] $*"; }
error() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [ERROR] $*" >&2; exit 1; }

[[ -z "${BACKUP_FILE}" ]] && error "Usage: $0 <backup.sql.gz> [minio-archive-path]"
[[ -f "${BACKUP_FILE}" ]] || error "Backup file not found: ${BACKUP_FILE}"

log "⚠️  Starting restore. THIS WILL DROP AND RECREATE DATABASE: ${DB_NAME}"
read -rp "Type 'YES' to confirm: " CONFIRM
[[ "${CONFIRM}" == "YES" ]] || { log "Aborted."; exit 0; }

# ─── Restore PostgreSQL ───────────────────────────────────────────────────────
log "Dropping existing database..."
PGPASSWORD="${DB_PASSWORD:-}" psql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname=postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB_NAME}';"

PGPASSWORD="${DB_PASSWORD:-}" dropdb \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --if-exists "${DB_NAME}"

PGPASSWORD="${DB_PASSWORD:-}" createdb \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  "${DB_NAME}"

log "Restoring from ${BACKUP_FILE}..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD:-}" psql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --quiet

log "PostgreSQL restore complete."

# ─── Restore MinIO ───────────────────────────────────────────────────────────
if [[ -n "${MINIO_BACKUP}" ]]; then
  log "Restoring MinIO from archive: ${MINIO_BACKUP}"
  command -v mc >/dev/null 2>&1 || error "mc not found"
  mc mirror \
    --preserve \
    --overwrite \
    --retry \
    "${MINIO_ALIAS}/${MINIO_BACKUP}" \
    "${MINIO_ALIAS}/hrmanager"
  log "MinIO restore complete."
fi

log "✅ Restore finished successfully."
