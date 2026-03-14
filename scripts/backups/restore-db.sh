#!/bin/bash

# Davasoft Database Restore Script
# Usage: ./scripts/backups/restore-db.sh <backup_file>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <backup_file>${NC}"
    echo "Available backups:"
    ls -la ./backups/davasoft_backup_*.sql* 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: File not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}=== Warning ===${NC}"
echo "This will overwrite the current database!"
echo "Backup file: $BACKUP_FILE"
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Operation cancelled"
    exit 0
fi

echo -e "${GREEN}=== Restoring Database ===${NC}"

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    TEMP_FILE=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
fi

# Restore
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set${NC}"
    exit 1
fi

psql "$DATABASE_URL" < "$BACKUP_FILE"

echo -e "${GREEN}=== Database restored successfully ===${NC}"