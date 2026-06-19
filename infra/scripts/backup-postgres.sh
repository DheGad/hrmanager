#!/usr/bin/env bash
# =============================================================================
# HRManager4U.ai — PostgreSQL Backup Script
# Usage: ./backup-postgres.sh
# Env vars: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, BACKUP_DIR, S3_BUCKET
# =============================================================================

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────────────────
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-hrmanager}"
DB_NAME="${DB_NAME:-hrmanager4u}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgres}"
S3_BUCKET="${S3_BUCKET:-hrmanager-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# ─── Logging ────────────────────────────────────────────────────────────────
log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [BACKUP] $*"; }
error() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [ERROR] $*" >&2; exit 1; }

log "Starting PostgreSQL backup: ${DB_NAME}"

# ─── Pre-flight checks ───────────────────────────────────────────────────────
command -v pg_dump >/dev/null 2>&1 || error "pg_dump not found"
mkdir -p "${BACKUP_DIR}"

# ─── Dump ────────────────────────────────────────────────────────────────────
PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --format=plain \
  --no-owner \
  --no-acl \
  --compress=0 \
  | gzip -9 > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
log "Backup complete: ${BACKUP_FILE} (${BACKUP_SIZE})"

# ─── Upload to S3/MinIO ──────────────────────────────────────────────────────
if command -v mc >/dev/null 2>&1; then
  mc cp "${BACKUP_FILE}" "minio/${S3_BUCKET}/postgres/${DB_NAME}_${TIMESTAMP}.sql.gz"
  log "Uploaded to MinIO: ${S3_BUCKET}/postgres/${DB_NAME}_${TIMESTAMP}.sql.gz"
elif command -v aws >/dev/null 2>&1; then
  aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/postgres/${DB_NAME}_${TIMESTAMP}.sql.gz"
  log "Uploaded to S3: s3://${S3_BUCKET}/postgres/${DB_NAME}_${TIMESTAMP}.sql.gz"
else
  log "WARNING: No S3 client found. Backup kept locally only."
fi

# ─── Cleanup old backups ─────────────────────────────────────────────────────
log "Removing backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete
log "Cleanup complete."

log "PostgreSQL backup finished successfully."
