#!/bin/bash
# scripts/index-codebase.sh
# Universal Codebase Intelligence Indexer
# Scans codebase and generates intelligence files

set -e

# Configuration
INTEL_DIR=".gsd/intel"
SRC_DIRS=("src" "lib" "app" "packages")
INCREMENTAL=false
VERBOSE=false
TARGET_DIR=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --incremental|-i)
      INCREMENTAL=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --dir|-d)
      TARGET_DIR="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --incremental, -i    Only index changed files"
      echo "  --verbose, -v        Show detailed output"
      echo "  --dir DIR, -d DIR    Index specific directory"
      echo "  --help, -h           Show this help"
      echo ""
      echo "Examples:"
      echo "  $0                   # Full index"
      echo "  $0 --incremental     # Only changed files"
      echo "  $0 --dir src/lib     # Index specific directory"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Helper functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_verbose() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[VERBOSE]${NC} $1"
  fi
}

# Initialize intelligence directory
init_intel_dir() {
  log_info "Initializing intelligence directory..."
  mkdir -p "$INTEL_DIR"
  
  # Create empty files if they don't exist
  [ ! -f "$INTEL_DIR/index.json" ] && echo '{"files":{},"totalFiles":0}' > "$INTEL_DIR/index.json"
  [ ! -f "$INTEL_DIR/conventions.json" ] && echo '{"naming":{},"directories":{},"fileSuffixes":{},"importPatterns":{}}' > "$INTEL_DIR/conventions.json"
  [ ! -f "$INTEL_DIR/graph.json" ] && echo '{"nodes":{},"edges":[],"clusters":[]}' > "$INTEL_DIR/graph.json"
  [ ! -f "$INTEL_DIR/hotspots.json" ] && echo '{"byChanges":[],"byCentrality":[],"byComplexity":[]}' > "$INTEL_DIR/hotspots.json"
  [ ! -f "$INTEL_DIR/metadata.json" ] && echo '{"version":"1.0.0","errors":[],"warnings":[]}' > "$INTEL_DIR/metadata.json"
  
  log_success "Intelligence directory initialized"
}

# Find source directories
find_source_dirs() {
  local dirs=()
  
  if [ -n "$TARGET_DIR" ]; then
    if [ -d "$TARGET_DIR" ]; then
      dirs+=("$TARGET_DIR")
    else
      log_error "Directory not found: $TARGET_DIR"
      exit 1
    fi
  else
    for dir in "${SRC_DIRS[@]}"; do
      if [ -d "$dir" ]; then
        dirs+=("$dir")
        log_verbose "Found source directory: $dir"
      fi
    done
  fi
  
  if [ ${#dirs[@]} -eq 0 ]; then
    log_warn "No source directories found. Checked: ${SRC_DIRS[*]}"
    log_warn "Use --dir to specify a custom directory"
    exit 1
  fi
  
  echo "${dirs[@]}"
}

# Find files to index
find_files() {
  local dirs=("$@")
  local files=()
  
  log_info "Scanning for source files..."
  
  for dir in "${dirs[@]}"; do
    while IFS= read -r -d '' file; do
      files+=("$file")
    done < <(find "$dir" -type f \( \
      -name "*.ts" -o \
      -name "*.tsx" -o \
      -name "*.js" -o \
      -name "*.jsx" -o \
      -name "*.py" -o \
      -name "*.go" -o \
      -name "*.rs" -o \
      -name "*.java" -o \
      -name "*.c" -o \
      -name "*.cpp" -o \
      -name "*.h" -o \
      -name "*.hpp" \
    \) -print0)
  done
  
  log_success "Found ${#files[@]} source files"
  echo "${files[@]}"
}

# Extract exports from TypeScript/JavaScript file
extract_ts_exports() {
  local file="$1"
  local exports=()
  
  # Extract default exports
  while IFS= read -r line; do
    if [[ $line =~ export[[:space:]]+default[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*) ]]; then
      exports+=("{\"name\":\"${BASH_REMATCH[1]}\",\"kind\":\"default\"}")
    fi
  done < "$file"
  
  # Extract named exports
  while IFS= read -r line; do
    if [[ $line =~ export[[:space:]]+(const|let|var|function|class|interface|type)[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*) ]]; then
      exports+=("{\"name\":\"${BASH_REMATCH[2]}\",\"kind\":\"named\",\"type\":\"${BASH_REMATCH[1]}\"}")
    fi
  done < "$file"
  
  # Join exports with commas
  local result=$(IFS=,; echo "${exports[*]}")
  echo "[$result]"
}

# Extract imports from TypeScript/JavaScript file
extract_ts_imports() {
  local file="$1"
  local imports=()
  
  # Extract import statements
  while IFS= read -r line; do
    if [[ $line =~ import[[:space:]]+.*[[:space:]]+from[[:space:]]+[\'\"](.*)[\'\" ] ]]; then
      local from="${BASH_REMATCH[1]}"
      imports+=("{\"from\":\"$from\"}")
    fi
  done < "$file"
  
  # Join imports with commas
  local result=$(IFS=,; echo "${imports[*]}")
  echo "[$result]"
}

# Detect language from file extension
detect_language() {
  local file="$1"
  case "$file" in
    *.ts|*.tsx) echo "typescript" ;;
    *.js|*.jsx) echo "javascript" ;;
    *.py) echo "python" ;;
    *.go) echo "go" ;;
    *.rs) echo "rust" ;;
    *.java) echo "java" ;;
    *.c|*.h) echo "c" ;;
    *.cpp|*.hpp) echo "cpp" ;;
    *) echo "unknown" ;;
  esac
}

# Index a single file
index_file() {
  local file="$1"
  local language=$(detect_language "$file")
  
  log_verbose "Indexing: $file ($language)"
  
  # Get file modification time
  local mtime=$(stat -f "%Sm" -t "%Y-%m-%dT%H:%M:%SZ" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null || echo "unknown")
  
  # Extract exports and imports based on language
  local exports="[]"
  local imports="[]"
  
  case "$language" in
    typescript|javascript)
      exports=$(extract_ts_exports "$file")
      imports=$(extract_ts_imports "$file")
      ;;
    python)
      # TODO: Implement Python parsing
      log_verbose "Python parsing not yet implemented"
      ;;
    *)
      log_verbose "Language $language not yet supported for parsing"
      ;;
  esac
  
  # Create file entry (simplified - real implementation would use jq)
  echo "  \"$file\": {"
  echo "    \"path\": \"$file\","
  echo "    \"language\": \"$language\","
  echo "    \"lastModified\": \"$mtime\","
  echo "    \"exports\": $exports,"
  echo "    \"imports\": $imports"
  echo "  }"
}

# Build index
build_index() {
  local files=("$@")
  local total=${#files[@]}
  local current=0
  
  log_info "Building index for $total files..."
  
  # Start JSON
  echo "{" > "$INTEL_DIR/index.json.tmp"
  echo "  \"files\": {" >> "$INTEL_DIR/index.json.tmp"
  
  # Index each file
  for file in "${files[@]}"; do
    current=$((current + 1))
    
    if [ "$VERBOSE" = false ]; then
      # Show progress
      printf "\r  Progress: %d/%d files (%.0f%%)" "$current" "$total" "$((current * 100 / total))"
    fi
    
    # Index file and append to JSON
    index_file "$file" >> "$INTEL_DIR/index.json.tmp"
    
    # Add comma if not last file
    if [ $current -lt $total ]; then
      echo "," >> "$INTEL_DIR/index.json.tmp"
    fi
  done
  
  if [ "$VERBOSE" = false ]; then
    echo "" # New line after progress
  fi
  
  # Close JSON
  echo "  }," >> "$INTEL_DIR/index.json.tmp"
  echo "  \"totalFiles\": $total," >> "$INTEL_DIR/index.json.tmp"
  echo "  \"lastIndexed\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" >> "$INTEL_DIR/index.json.tmp"
  echo "}" >> "$INTEL_DIR/index.json.tmp"
  
  # Move temp file to final location
  mv "$INTEL_DIR/index.json.tmp" "$INTEL_DIR/index.json"
  
  log_success "Index built successfully"
}

# Detect naming conventions
detect_conventions() {
  log_info "Detecting naming conventions..."
  
  # This is a simplified version
  # Real implementation would analyze index.json and detect patterns
  
  cat > "$INTEL_DIR/conventions.json" << 'EOF'
{
  "naming": {
    "components": {
      "pattern": "PascalCase",
      "confidence": 0.0,
      "examples": []
    },
    "utilities": {
      "pattern": "camelCase",
      "confidence": 0.0,
      "examples": []
    }
  },
  "directories": {},
  "fileSuffixes": {
    ".test.ts": "Test files",
    ".spec.ts": "Specification files",
    ".d.ts": "TypeScript declarations"
  },
  "importPatterns": {}
}
EOF
  
  log_success "Conventions detected"
}

# Build dependency graph
build_graph() {
  log_info "Building dependency graph..."
  
  # Simplified version - real implementation would analyze imports
  cat > "$INTEL_DIR/graph.json" << 'EOF'
{
  "nodes": {},
  "edges": [],
  "clusters": []
}
EOF
  
  log_success "Dependency graph built"
}

# Identify hotspots
identify_hotspots() {
  log_info "Identifying hotspots..."
  
  # Use git log to find frequently changed files
  local hotspots=()
  
  if [ -d ".git" ]; then
    while IFS= read -r line; do
      if [[ $line =~ ^[0-9]+[[:space:]]+(.*) ]]; then
        local commits="${BASH_REMATCH[1]%%[[:space:]]*}"
        local file="${BASH_REMATCH[1]#*[[:space:]]}"
        hotspots+=("{\"path\":\"$file\",\"commits\":$commits}")
      fi
    done < <(git log --all --format=format: --name-only | sort | uniq -c | sort -rn | head -20)
  fi
  
  # Build hotspots JSON
  local result=$(IFS=,; echo "${hotspots[*]}")
  cat > "$INTEL_DIR/hotspots.json" << EOF
{
  "byChanges": [$result],
  "byCentrality": [],
  "byComplexity": []
}
EOF
  
  log_success "Hotspots identified"
}

# Generate summary
generate_summary() {
  log_info "Generating summary..."
  
  # Read total files from index
  local total_files=$(grep -o '"totalFiles":[[:space:]]*[0-9]*' "$INTEL_DIR/index.json" | grep -o '[0-9]*')
  
  cat > "$INTEL_DIR/summary.md" << EOF
# Codebase Intelligence Summary

**Last Updated**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Total Files**: $total_files files indexed

## Project Structure

This summary is automatically generated from codebase analysis.
AI assistants should read this file to understand the codebase structure and conventions.

## Detected Patterns

[WARN] Full pattern detection not yet implemented.
This is a minimal summary. Run indexing again after implementation is complete.

## Key Files

Check \`.gsd/intel/hotspots.json\` for frequently changed files.

## Recommendations for AI

1. Follow existing naming conventions
2. Maintain consistent import patterns
3. Keep file structure organized
4. Add tests for new functionality

## Quick Reference

**To understand the codebase**:
1. Read this summary
2. Check \`.gsd/intel/index.json\` for exports/imports
3. Check \`.gsd/intel/graph.json\` for dependencies
4. Check \`.gsd/intel/hotspots.json\` for critical files
EOF
  
  log_success "Summary generated"
}

# Save metadata
save_metadata() {
  local duration="$1"
  local total_files="$2"
  
  log_info "Saving metadata..."
  
  cat > "$INTEL_DIR/metadata.json" << EOF
{
  "version": "1.0.0",
  "lastIndexed": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "indexedBy": "scripts/index-codebase.sh",
  "duration": "${duration}s",
  "statistics": {
    "totalFiles": $total_files
  },
  "errors": [],
  "warnings": [
    "Full implementation pending - this is a minimal index"
  ]
}
EOF
  
  log_success "Metadata saved"
}

# Main execution
main() {
  local start_time=$(date +%s)
  
  echo ""
  log_info "=== GSD Codebase Intelligence Indexer ==="
  echo ""
  
  # Initialize
  init_intel_dir
  
  # Find source directories
  local source_dirs=($(find_source_dirs))
  log_info "Source directories: ${source_dirs[*]}"
  
  # Find files
  local files=($(find_files "${source_dirs[@]}"))
  
  if [ ${#files[@]} -eq 0 ]; then
    log_warn "No files found to index"
    exit 0
  fi
  
  # Build index
  build_index "${files[@]}"
  
  # Detect conventions
  detect_conventions
  
  # Build graph
  build_graph
  
  # Identify hotspots
  identify_hotspots
  
  # Generate summary
  generate_summary
  
  # Calculate duration
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  
  # Save metadata
  save_metadata "$duration" "${#files[@]}"
  
  echo ""
  log_success "=== Indexing Complete ==="
  log_info "Duration: ${duration}s"
  log_info "Files indexed: ${#files[@]}"
  log_info "Output directory: $INTEL_DIR"
  echo ""
  log_info "Next steps:"
  echo "  1. Review: .gsd/intel/summary.md"
  echo "  2. Commit: git add .gsd/intel/ && git commit -m 'feat: Add codebase intelligence'"
  echo "  3. Use: AI can now read summary.md for context"
  echo ""
}

# Run main
main
