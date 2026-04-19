#!/bin/bash
# memory-index.sh - Index memory entries with SQLite FTS5

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DB_PATH=".gsd/memory/index.db"
MEMORY_DIR=".gsd/memory"

# Logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if sqlite3 is available
check_sqlite() {
    if ! command -v sqlite3 &> /dev/null; then
        log_error "sqlite3 not found. Please install SQLite."
        log_info "On Ubuntu/Debian: sudo apt-get install sqlite3"
        log_info "On Mac: brew install sqlite3"
        log_info "On Windows: Download from https://www.sqlite.org/download.html"
        return 1
    fi
    return 0
}

# Create database and table
create_database() {
    log_info "Creating database: $DB_PATH"
    
    sqlite3 "$DB_PATH" << 'EOF'
-- Create FTS5 virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS memory USING fts5(
    filename,
    type,
    date,
    tags,
    content,
    tokenize = 'porter unicode61'
);

-- Create metadata table
CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Store last index time
INSERT OR REPLACE INTO metadata (key, value) 
VALUES ('last_indexed', datetime('now'));
EOF
    
    log_success "Database created"
}

# Extract metadata from markdown file
extract_metadata() {
    local file="$1"
    local type=""
    local date=""
    local tags=""
    
    # Determine type from directory
    if [[ "$file" == *"/journal/"* ]]; then
        type="journal"
    elif [[ "$file" == *"/decisions/"* ]]; then
        type="decision"
    elif [[ "$file" == *"/patterns/"* ]]; then
        type="pattern"
    elif [[ "$file" == *"/learnings/"* ]]; then
        type="learning"
    fi
    
    # Extract date from filename (YYYY-MM-DD format)
    if [[ $(basename "$file") =~ ^([0-9]{4}-[0-9]{2}-[0-9]{2}) ]]; then
        date="${BASH_REMATCH[1]}"
    fi
    
    # Extract tags from content
    tags=$(grep -oP '(?<=`)[^`]+(?=`)' "$file" | tail -1 || echo "")
    
    echo "$type|$date|$tags"
}

# Index a single file
index_file() {
    local file="$1"
    
    # Skip if not a markdown file
    if [[ ! "$file" =~ \.md$ ]]; then
        return 0
    fi
    
    # Skip templates
    if [[ "$file" == *"/templates/"* ]]; then
        return 0
    fi
    
    # Extract metadata
    local metadata=$(extract_metadata "$file")
    local type=$(echo "$metadata" | cut -d'|' -f1)
    local date=$(echo "$metadata" | cut -d'|' -f2)
    local tags=$(echo "$metadata" | cut -d'|' -f3)
    
    # Read content
    local content=$(cat "$file")
    
    # Escape single quotes for SQL
    content="${content//\'/\'\'}"
    tags="${tags//\'/\'\'}"
    
    # Insert into database
    sqlite3 "$DB_PATH" << EOF
INSERT INTO memory (filename, type, date, tags, content)
VALUES ('$file', '$type', '$date', '$tags', '$content');
EOF
}

# Index all files
index_all() {
    log_info "Indexing memory files..."
    
    # Clear existing index
    sqlite3 "$DB_PATH" "DELETE FROM memory;"
    
    local count=0
    
    # Index journal entries
    if [[ -d "$MEMORY_DIR/journal" ]]; then
        for file in "$MEMORY_DIR/journal"/*.md; do
            if [[ -f "$file" ]]; then
                index_file "$file"
                ((count++))
            fi
        done
    fi
    
    # Index decisions
    if [[ -d "$MEMORY_DIR/decisions" ]]; then
        for file in "$MEMORY_DIR/decisions"/*.md; do
            if [[ -f "$file" ]]; then
                index_file "$file"
                ((count++))
            fi
        done
    fi
    
    # Index patterns
    if [[ -d "$MEMORY_DIR/patterns" ]]; then
        for file in "$MEMORY_DIR/patterns"/*.md; do
            if [[ -f "$file" ]]; then
                index_file "$file"
                ((count++))
            fi
        done
    fi
    
    # Index learnings
    if [[ -d "$MEMORY_DIR/learnings" ]]; then
        for file in "$MEMORY_DIR/learnings"/*.md; do
            if [[ -f "$file" ]]; then
                index_file "$file"
                ((count++))
            fi
        done
    fi
    
    log_success "Indexed $count files"
}

# Main
main() {
    # Check sqlite3
    if ! check_sqlite; then
        exit 1
    fi
    
    # Create database if it doesn't exist
    if [[ ! -f "$DB_PATH" ]]; then
        create_database
    fi
    
    # Index all files
    index_all
    
    log_success "Memory index updated"
}

main "$@"
