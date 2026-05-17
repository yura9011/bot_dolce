#!/bin/bash
# memory-recent.sh - Show recent memory entries

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
MEMORY_DIR=".gsd/memory"

# Usage
show_help() {
    cat << EOF
Show recent memory entries

USAGE:
    ./memory-recent.sh [OPTIONS]

OPTIONS:
    --type TYPE         Filter by type (journal, decision, pattern, learning)
    --limit N           Number of entries (default: 5)
    --full              Show full content (default: summary only)
    -h, --help          Show this help

EXAMPLES:
    # Last 5 entries
    ./memory-recent.sh

    # Last 10 journal entries
    ./memory-recent.sh --type journal --limit 10

    # Last 3 entries with full content
    ./memory-recent.sh --limit 3 --full

EOF
}

# Show entry summary
show_summary() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo -e "${GREEN}$filename${NC}"
    echo -e "${CYAN}$(dirname "$file" | xargs basename)${NC}"
    
    # Show first few lines
    head -n 5 "$file" | tail -n 3
    echo ""
}

# Show full entry
show_full() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$filename${NC}"
    echo -e "${CYAN}$(dirname "$file" | xargs basename)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    cat "$file"
    echo ""
}

# Main
main() {
    local type=""
    local limit=5
    local full=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --type)
                type="$2"
                shift 2
                ;;
            --limit)
                limit="$2"
                shift 2
                ;;
            --full)
                full=true
                shift
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
    
    # Determine search directory
    local search_dir="$MEMORY_DIR"
    if [[ -n "$type" ]]; then
        search_dir="$MEMORY_DIR/$type"
    fi
    
    if [[ ! -d "$search_dir" ]]; then
        echo "No entries found"
        exit 0
    fi
    
    echo -e "${BLUE}Recent memory entries:${NC}"
    echo ""
    
    # Find and sort files by modification time
    local files=$(find "$search_dir" -name "*.md" -not -path "*/templates/*" -type f -printf '%T@ %p\n' | sort -rn | head -n "$limit" | cut -d' ' -f2-)
    
    if [[ -z "$files" ]]; then
        echo "No entries found"
        exit 0
    fi
    
    # Show entries
    while IFS= read -r file; do
        if [[ "$full" == "true" ]]; then
            show_full "$file"
        else
            show_summary "$file"
        fi
    done <<< "$files"
}

main "$@"
