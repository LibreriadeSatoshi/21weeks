#!/usr/bin/env sh
# Copia diaria de MySQL. Se ejecuta en el servidor desde cron (ver deploy/README.md).
# Guarda los últimos 14 días en ~/backups y, si BACKUP_S3_URI está definido
# (p. ej. s3://ismos-backups/21weeks), sube cada copia a S3.
set -eu

cd "$(dirname "$0")/.."
. ./.env

dir="${BACKUP_DIR:-$HOME/backups}"
file="$dir/21weeks-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
mkdir -p "$dir"

docker compose -f docker-compose.prod.yml exec -T -e MYSQL_PWD="$MYSQL_PASSWORD" db \
  mysqldump --single-transaction --no-tablespaces -u21weeks 21weeks | gzip > "$file"

if [ -n "${BACKUP_S3_URI:-}" ]; then
  aws s3 cp "$file" "$BACKUP_S3_URI/"
fi

find "$dir" -name '21weeks-*.sql.gz' -mtime +14 -delete
echo "backup: $file"
