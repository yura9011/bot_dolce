#!/bin/bash
# memory-add.sh - Add entry to agent memory system

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage
show_help() {
    cat << EOF
Add entry to agent memory system

USAGE:
    ./memory-add.sh TYPE [OPTIONS]

TYPES:
    journal     Agent reflection and observations
    decision    Technical/architectural decision
    pattern     Detected behavior pattern
    learning    Technical learning or discovery

OPTIONS:
    --content FILE      Read content from file
    --stdin             Read content from stdin
    --template          Use template (opens in editor)
    --tags "tag1,tag2"  Add custom tags
    -h, --help          Show this help

EXAMPLES:
    # From file
    ./memory-add.sh journal --content my-reflection.md

    # From stdin
    echo "Today I learned..." | ./memory-add.sh learning --stdin

    # Using template
    ./memory-add.sh journal --template

    # Quick entry
    ./memory-add.sh decision --content decision.md --tags "architecture,database"

EOF
}

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

# Validate type
validate_type() {
    local type="$1"
    case "$type" in
        journal|decision|pattern|learning)
            return 0
            ;;
        *)
            log_error "Invalid type: $type"
            log_error "Valid types: journal, decision, pattern, learning"
            return 1
            ;;
    esac
}

# Generate filename
generate_filename() {
    local type="$1"
    local timestamp=$(date +%Y-%m-%d-%H-%M-%S)
    echo "${timestamp}-${type}.md"
}

# Get memory directory
get_memory_dir() {
    local type="$1"
    echo ".gsd/memory/${type}"
}

# Add entry
add_entry() {
    local type="$1"
    local content="$2"
    local tags="$3"
    
    # Validate type
    if ! validate_type "$type"; then
        return 1
    fi
    
    # Generate filename
    local filename=$(generate_filename "$type")
    local memory_dir=$(get_memory_dir "$type")
    local filepath="${memory_dir}/${filename}"
    
    # Ensure directory exists
    mkdir -p "$memory_dir"
    
    # Write content
    echo "$content" > "$filepath"
    
    # Add tags if provided
    if [[ -n "$tags" ]]; then
        echo "" >> "$filepath"
        echo "---" >> "$filepath"
        echo "" >> "$filepath"
        echo "## Tags" >> "$filepath"
        echo "" >> "$filepath"
        echo "\`$tags\`" >> "$filepath"
    fi
    
    log_success "Entry created: $filepath"
    
    # Trigger indexing if script exists
    if [[ -x ".gsd/scripts/memory-index.sh" ]]; then
        log_info "Indexing memory..."
        .gsd/scripts/memory-index.sh
    fi
    
    return 0
}

# Use template
use_template() {
    local type="$1"
    local tags="$2"
    
    # Validate type
    if ! validate_type "$type"; then
        return 1
    fi
    
    # Check if template exists
    local template=".gsd/memory/templates/${type}.md"
    if [[ ! -f "$template" ]]; then
        log_error "Template not found: $template"
        return 1
    fi
    
    # Generate filename
    local filename=$(generate_filename "$type")
    local memory_dir=$(get_memory_dir "$type")
    local filepath="${memory_dir}/${filename}"
    
    # Ensure directory exists
    mkdir -p "$memory_dir"
    
    # Copy template
    cp "$template" "$filepath"
    
    # Add tags if provided
    if [[ -n "$tags" ]]; then
        echo "" >> "$filepath"
        echo "---" >> "$filepath"
        echo "" >> "$filepath"
        echo "## Tags" >> "$filepath"
        echo "" >> "$filepath"
        echo "\`$tags\`" >> "$filepath"
    fi
    
    log_info "Template copied to: $filepath"
    
    # Open in editor if available
    if [[ -n "${EDITOR:-}" ]]; then
        log_info "Opening in editor: $EDITOR"
        $EDITOR "$filepath"
    else
        log_info "Edit the file manually: $filepath"
    fi
    
    # Trigger indexing if script exists
    if [[ -x ".gsd/scripts/memory-index.sh" ]]; then
        log_info "Indexing memory..."
        .gsd/scripts/memory-index.sh
    fi
    
    return 0
}

# Main
main() {
    local type=""
    local content=""
    local use_stdin=false
    local use_template_flag=false
    local tags=""
    
    # Parse arguments
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    type="$1"
    shift
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --content)
                if [[ ! -f "$2" ]]; then
                    log_error "File not found: $2"
                    exit 1
                fi
                content=$(cat "$2")
                shift 2
                ;;
            --stdin)
                use_stdin=true
                shift
                ;;
            --template)
                use_template_flag=true
                shift
                ;;
            --tags)
                tags="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Handle template mode
    if [[ "$use_template_flag" == "true" ]]; then
        use_template "$type" "$tags"
        exit $?
    fi
    
    # Read from stdin if requested
    if [[ "$use_stdin" == "true" ]]; then
        content=$(cat)
    fi
    
    # Validate content
    if [[ -z "$content" ]]; then
        log_error "No content provided. Use --content, --stdin, or --template"
        show_help
        exit 1
    fi
    
    # Add entry
    add_entry "$type" "$content" "$tags"
}

main "$@"
