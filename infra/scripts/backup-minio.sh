#!/usr/bin/env bash
# =============================================================================
# HRManager4U.ai — MinIO Backup Script
# Uses MinIO Client (mc) to mirror bucket to backup location
# =============================================================================

set -euo pipefail

MINIO_ALIAS="${MINIO_ALIAS:-minio}"
MINIO_BUCKET="${MINIO_BUCKET:-hrmanager}"
BACKUP_BUCKET="${BACKUP_BUCKET:-hrmanager-backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [MINIO-BACKUP] $*"; }
error() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [ERROR] $*" >&2; exit 1; }

command -v mc >/dev/null 2>&1 || error "mc (MinIO client) not found"

log "Starting MinIO backup: ${MINIO_BUCKET} → ${BACKUP_BUCKET}/archive/${TIMESTAMP}"

mc mirror \
  --preserve \
  --retry \
  "${MINIO_ALIAS}/${MINIO_BUCKET}" \
  "${MINIO_ALIAS}/${BACKUP_BUCKET}/archive/${TIMESTAMP}"

log "MinIO backup complete."

# Retention: remove archives older than 30 days
log "Cleaning old archives (>30 days)..."
mc ls "${MINIO_ALIAS}/${BACKUP_BUCKET}/archive/" | while read -r _date _time _size dir; do
  DIR_DATE=$(echo "$dir" | cut -c1-8)
  CUTOFF=$(date -d "-30 days" +%Y%m%d 2>/dev/null || date -v-30d +%Y%m%d)
  if [[ "$DIR_DATE" < "$CUTOFF" ]]; then
    mc rm --recursive --force "${MINIO_ALIAS}/${BACKUP_BUCKET}/archive/${dir}"
    log "Removed old archive: ${dir}"
  fi
done

log "MinIO backup finished successfully."
