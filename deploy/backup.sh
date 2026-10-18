#!/usr/bin/env sh
# Daily MySQL backup. Runs on the server from cron (see deploy/README.md).
# Keeps the last 14 days in ~/backups and, if BACKUP_S3_URI is set
# (e.g. s3://ismos-backups/21weeks), uploads each backup to S3.
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
