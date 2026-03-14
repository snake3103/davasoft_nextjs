#!/bin/bash

# Davasoft Database Backup Script
# Usage: ./scripts/backups/backup-db.sh

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/davasoft_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=${RETENTION_DAYS:-7}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Davasoft Database Backup ===${NC}"

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set${NC}"
    exit 1
fi

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "Starting backup..."
if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}Backup created: $BACKUP_FILE${NC}"
else
    # Try with sslmode
    if pg_dump "$DATABASE_URL?sslmode=require" > "$BACKUP_FILE" 2>/dev/null; then
        echo -e "${GREEN}Backup created (SSL): $BACKUP_FILE${NC}"
    else
        echo -e "${RED}Error: Failed to create backup${NC}"
        exit 1
    fi
fi

# Get file size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup size: $SIZE"

# Clean old backups
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "davasoft_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete

# Count remaining backups
COUNT=$(find "$BACKUP_DIR" -name "davasoft_backup_*.sql" -type f | wc -l)
echo "Remaining backups: $COUNT"

# Optional: Compress backup
if command -v gzip &> /dev/null; then
    gzip "$BACKUP_FILE"
    echo -e "${GREEN}Backup compressed: ${BACKUP_FILE}.gz${NC}"
fi

echo -e "${GREEN}=== Backup completed successfully ===${NC}"