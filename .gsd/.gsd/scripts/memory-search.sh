#!/bin/bash
# memory-search.sh - Search agent memory

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DB_PATH=".gsd/memory/index.db"
MEMORY_DIR=".gsd/memory"

# Usage
show_help() {
    cat << EOF
Search agent memory

USAGE:
    ./memory-search.sh QUERY [OPTIONS]

OPTIONS:
    --type TYPE         Filter by type (journal, decision, pattern, learning)
    --from DATE         Filter from date (YYYY-MM-DD)
    --to DATE           Filter to date (YYYY-MM-DD)
    --limit N           Limit results (default: 10)
    -h, --help          Show this help

EXAMPLES:
    # Search all
    ./memory-search.sh "user communication"

    # Search journal only
    ./memory-search.sh "migration" --type journal

    # Search date range
    ./memory-search.sh "bash" --from 2026-02-20 --to 2026-02-25

    # Limit results
    ./memory-search.sh "decision" --limit 5

EOF
}

# Search with SQLite FTS5
search_sqlite() {
    local query="$1"
    local type="$2"
    local from_date="$3"
    local to_date="$4"
    local limit="$5"
    
    local where_clause="content MATCH '$query'"
    
    if [[ -n "$type" ]]; then
        where_clause="$where_clause AND type = '$type'"
    fi
    
    if [[ -n "$from_date" ]]; then
        where_clause="$where_clause AND date >= '$from_date'"
    fi
    
    if [[ -n "$to_date" ]]; then
        where_clause="$where_clause AND date <= '$to_date'"
    fi
    
    sqlite3 "$DB_PATH" << EOF
.mode column
.headers on
SELECT 
    type,
    date,
    filename,
    snippet(memory, 4, '<mark>', '</mark>', '...', 32) as snippet
FROM memory
WHERE $where_clause
ORDER BY rank
LIMIT $limit;
EOF
}

# Search with ripgrep (fallback)
search_ripgrep() {
    local query="$1"
    local type="$2"
    local limit="$3"
    
    local search_dir="$MEMORY_DIR"
    
    if [[ -n "$type" ]]; then
        search_dir="$MEMORY_DIR/$type"
    fi
    
    if [[ ! -d "$search_dir" ]]; then
        echo "No results found"
        return 0
    fi
    
    echo -e "${CYAN}Results:${NC}"
    echo ""
    
    rg --color=always \
       --heading \
       --line-number \
       --context 2 \
       --max-count "$limit" \
       "$query" \
       "$search_dir" || echo "No results found"
}

# Main
main() {
    local query=""
    local type=""
    local from_date=""
    local to_date=""
    local limit=10
    
    # Parse arguments
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    query="$1"
    shift
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --type)
                type="$2"
                shift 2
                ;;
            --from)
                from_date="$2"
                shift 2
                ;;
            --to)
                to_date="$2"
                shift 2
                ;;
            --limit)
                limit="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check if SQLite is available and database exists
    if command -v sqlite3 &> /dev/null && [[ -f "$DB_PATH" ]]; then
        echo -e "${BLUE}Searching with SQLite FTS5...${NC}"
        echo ""
        search_sqlite "$query" "$type" "$from_date" "$to_date" "$limit"
    else
        echo -e "${YELLOW}SQLite not available, using ripgrep...${NC}"
        echo ""
        search_ripgrep "$query" "$type" "$limit"
    fi
}

main "$@"
