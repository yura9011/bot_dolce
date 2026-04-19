#!/bin/bash

# loop.sh - Ralph Loop autonomous execution engine
# Based on Geoffrey Huntley's Ralph Loop implementation
# https://github.com/ghuntley/how-to-ralph-wiggum

set -euo pipefail

# Default configuration
MODE="build"
MAX_ITERATIONS=50
SLEEP_DURATION=2
AI_CLI="kiro"  # Default to Kiro, can be changed to claude, openai, etc.
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage function
show_help() {
    cat << EOF
Ralph Loop - Autonomous Execution Engine

USAGE:
    ./loop.sh [OPTIONS] [MODE]

MODES:
    build    Execute PROMPT_build.md (default)
    plan     Execute PROMPT_plan.md

OPTIONS:
    -h, --help              Show this help message
    -i, --iterations NUM    Maximum iterations (default: 50)
    -s, --sleep NUM         Sleep duration between iterations (default: 2)
    -c, --cli COMMAND       AI CLI command (default: kiro)
    -v, --verbose           Verbose output
    --dry-run              Validate setup without executing

EXAMPLES:
    ./loop.sh                    # Build mode, default settings (kiro)
    ./loop.sh plan               # Planning mode
    ./loop.sh -i 10 build        # Build mode, max 10 iterations
    ./loop.sh -c claude build    # Use Claude CLI instead of Kiro
    ./loop.sh --dry-run          # Validate setup

The Ralph Loop executes AI prompts autonomously until completion.
Each iteration starts with fresh context for optimal performance.

EOF
}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation function
validate_setup() {
    local errors=0
    
    log_info "Validating Ralph Loop setup..."
    
    # Check required files
    local prompt_file="PROMPT_${MODE}.md"
    if [[ ! -f "$prompt_file" ]]; then
        log_error "Missing prompt file: $prompt_file"
        ((errors++))
    fi
    
    if [[ ! -f "AGENTS.md" ]]; then
        log_error "Missing AGENTS.md operational manual"
        ((errors++))
    fi
    
    if [[ ! -f "IMPLEMENTATION_PLAN.md" ]]; then
        log_error "Missing IMPLEMENTATION_PLAN.md task tracker"
        ((errors++))
    fi
    
    if [[ ! -d "specs" ]]; then
        log_error "Missing specs/ directory"
        ((errors++))
    fi
    
    # Check validation scripts
    if [[ ! -f "scripts/validate-all.sh" ]]; then
        log_error "Missing GSD validation script: scripts/validate-all.sh"
        ((errors++))
    else
        log_info "Found GSD validation script: scripts/validate-all.sh"
    fi
    
    # Check AI CLI
    if ! command -v "$AI_CLI" &> /dev/null; then
        log_error "AI CLI not found: $AI_CLI"
        log_info "Install AI CLI (claude, kiro, openai, etc.) or specify different CLI with --cli option"
        ((errors++))
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "Git not found - required for Ralph Loop"
        ((errors++))
    fi
    
    if [[ $errors -eq 0 ]]; then
        log_success "Ralph Loop setup validation passed"
        return 0
    else
        log_error "Ralph Loop setup validation failed with $errors errors"
        return 1
    fi
}

# Run validation
run_validation() {
    log_info "Running GSD validation (backpressure)..."
    
    if [[ -x "scripts/validate-all.sh" ]]; then
        if ./scripts/validate-all.sh; then
            log_success "Validation passed"
            return 0
        else
            log_error "Validation failed"
            return 1
        fi
    else
        log_warning "Validation script not executable, skipping"
        return 0
    fi
}

# Main execution loop
run_ralph_loop() {
    local prompt_file="PROMPT_${MODE}.md"
    local iteration=1
    
    log_info "Starting Ralph Loop in $MODE mode"
    log_info "Prompt file: $prompt_file"
    log_info "Max iterations: $MAX_ITERATIONS"
    log_info "AI CLI: $AI_CLI"
    
    while [[ $iteration -le $MAX_ITERATIONS ]]; do
        echo
        log_info "--- Iteration $iteration/$MAX_ITERATIONS ---"
        
        # Execute AI with prompt
        log_info "Executing AI iteration..."
        if [[ "$VERBOSE" == "true" ]]; then
            cat "$prompt_file" | "$AI_CLI" -p --dangerously-skip-permissions
        else
            cat "$prompt_file" | "$AI_CLI" -p --dangerously-skip-permissions > /dev/null 2>&1
        fi
        
        local ai_exit_code=$?
        
        if [[ $ai_exit_code -ne 0 ]]; then
            log_error "AI execution failed with exit code $ai_exit_code"
            log_info "Continuing to next iteration..."
        else
            log_success "AI iteration completed"
            
            # Run validation (backpressure)
            if run_validation; then
                log_success "Iteration $iteration validated successfully"
                
                # Auto git push
                if git push origin "$(git branch --show-current)" 2>/dev/null; then
                    log_success "Changes pushed to remote"
                else
                    log_warning "Failed to push changes (continuing anyway)"
                fi
            else
                log_warning "Validation failed, continuing to next iteration"
            fi
        fi
        
        # Sleep between iterations
        if [[ $iteration -lt $MAX_ITERATIONS ]]; then
            log_info "Sleeping for ${SLEEP_DURATION}s before next iteration..."
            sleep "$SLEEP_DURATION"
        fi
        
        ((iteration++))
    done
    
    log_info "Ralph Loop completed after $MAX_ITERATIONS iterations"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -i|--iterations)
            MAX_ITERATIONS="$2"
            shift 2
            ;;
        -s|--sleep)
            SLEEP_DURATION="$2"
            shift 2
            ;;
        -c|--cli)
            AI_CLI="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --dry-run)
            validate_setup
            exit $?
            ;;
        build|plan)
            MODE="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate setup before starting
if ! validate_setup; then
    exit 1
fi

# Run the Ralph Loop
run_ralph_loop

log_success "Ralph Loop execution complete"