#!/bin/bash

# test-ralph.sh - Ralph Loop System Validation Script
# Tests the complete Ralph Loop system setup without executing AI

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test function wrapper
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TESTS_TOTAL++))
    log_info "Testing: $test_name"
    
    if eval "$test_command"; then
        log_success "$test_name"
        return 0
    else
        log_fail "$test_name"
        return 1
    fi
}

# Usage function
show_help() {
    cat << EOF
Ralph Loop System Test Suite

USAGE:
    ./test-ralph.sh [OPTIONS]

OPTIONS:
    -h, --help      Show this help message
    --dry-run       Run validation tests without AI CLI checks
    --verbose       Show detailed test output

DESCRIPTION:
    Validates the complete Ralph Loop system setup including:
    - Required files and directory structure
    - Script functionality and cross-platform compatibility
    - Integration with GSD validation system
    - Error handling and configuration

EOF
}

# Test functions
test_required_files() {
    local files=("loop.sh" "loop.ps1" "AGENTS.md" "IMPLEMENTATION_PLAN.md" "PROMPT_build.md" "PROMPT_plan.md")
    local all_exist=true
    
    for file in "${files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_fail "Missing required file: $file"
            all_exist=false
        fi
    done
    
    if [[ ! -d "specs" ]]; then
        log_fail "Missing specs/ directory"
        all_exist=false
    fi
    
    if [[ ! -f "specs/roadmap.md" ]]; then
        log_fail "Missing specs/roadmap.md"
        all_exist=false
    fi
    
    $all_exist
}

test_loop_scripts_executable() {
    # Test bash script help
    if bash loop.sh --help > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

test_powershell_script() {
    # Test PowerShell script help (if PowerShell is available)
    if command -v powershell &> /dev/null; then
        if powershell -ExecutionPolicy Bypass -File loop.ps1 -Help > /dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    else
        log_warning "PowerShell not available, skipping PowerShell script test"
        return 0
    fi
}

test_agents_file_format() {
    local line_count
    line_count=$(wc -l < AGENTS.md)
    
    if [[ $line_count -le 60 ]]; then
        if grep -q "validate-all" AGENTS.md; then
            return 0
        else
            log_fail "AGENTS.md missing validation commands"
            return 1
        fi
    else
        log_fail "AGENTS.md too long: $line_count lines (max 60)"
        return 1
    fi
}

test_implementation_plan_format() {
    if grep -q "Phase 1" IMPLEMENTATION_PLAN.md && grep -q "\- \[ \]" IMPLEMENTATION_PLAN.md; then
        return 0
    else
        return 1
    fi
}

test_prompt_templates() {
    # Test PROMPT_build.md structure
    if grep -q "0a\. Study" PROMPT_build.md && grep -q "999999999999" PROMPT_build.md; then
        if grep -q "IMPLEMENTATION_PLAN.md" PROMPT_plan.md && grep -q "specs" PROMPT_plan.md; then
            return 0
        else
            log_fail "PROMPT_plan.md missing required content"
            return 1
        fi
    else
        log_fail "PROMPT_build.md missing required structure"
        return 1
    fi
}

test_gsd_validation_integration() {
    if [[ -f "scripts/validate-all.sh" ]] || [[ -f "scripts/validate-all.ps1" ]]; then
        # Check if loop scripts reference validation
        if grep -q "validate-all" loop.sh && grep -q "validate-all" loop.ps1; then
            return 0
        else
            log_fail "Loop scripts missing validation integration"
            return 1
        fi
    else
        log_fail "GSD validation scripts not found"
        return 1
    fi
}

test_git_repository() {
    if git status > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Main test execution
main() {
    local dry_run=false
    local verbose=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --verbose)
                verbose=true
                shift
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " RALPH LOOP SYSTEM VALIDATION"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    
    # Run tests
    run_test "Required files exist" "test_required_files"
    run_test "Loop scripts executable" "test_loop_scripts_executable"
    run_test "PowerShell script functional" "test_powershell_script"
    run_test "AGENTS.md format valid" "test_agents_file_format"
    run_test "IMPLEMENTATION_PLAN.md format valid" "test_implementation_plan_format"
    run_test "Prompt templates valid" "test_prompt_templates"
    run_test "GSD validation integration" "test_gsd_validation_integration"
    run_test "Git repository valid" "test_git_repository"
    
    # Summary
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " TEST RESULTS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo "Total Tests: $TESTS_TOTAL"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
    echo
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}✅ Ralph Loop system validation PASSED${NC}"
        echo "System is ready for autonomous execution!"
        exit 0
    else
        echo -e "${RED}❌ Ralph Loop system validation FAILED${NC}"
        echo "Fix the failed tests before running Ralph Loop."
        exit 1
    fi
}

# Run main function
main "$@"