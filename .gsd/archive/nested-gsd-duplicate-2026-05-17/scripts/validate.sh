#!/bin/bash
# GSD Consolidated Validation Script
# Universal validation that works in any environment with any AI assistant

set -e

# Colors for output (with fallback for environments without color support)
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

# Global counters
TOTAL_ERRORS=0
DRY_RUN=false

# Parse arguments
VALIDATE_CODE=false
VALIDATE_WORKFLOWS=false
VALIDATE_SKILLS=false
VALIDATE_TEMPLATES=false
VALIDATE_ALL=false

show_help() {
    echo "GSD Validation Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --all           Validate everything"
    echo "  --code          Validate code (JS, Python, etc.)"
    echo "  --workflows     Validate GSD workflows"
    echo "  --skills        Validate GSD skills"
    echo "  --templates     Validate GSD templates"
    echo "  --dry-run       Show what would be validated without running"
    echo "  --help          Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 --all                    # Validate everything"
    echo "  $0 --code --workflows       # Validate code and workflows only"
    echo "  $0 --dry-run --all          # Show what would be validated"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            VALIDATE_ALL=true
            shift
            ;;
        --code)
            VALIDATE_CODE=true
            shift
            ;;
        --workflows)
            VALIDATE_WORKFLOWS=true
            shift
            ;;
        --skills)
            VALIDATE_SKILLS=true
            shift
            ;;
        --templates)
            VALIDATE_TEMPLATES=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
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

# If --all is specified, enable all validations
if [[ "$VALIDATE_ALL" == true ]]; then
    VALIDATE_CODE=true
    VALIDATE_WORKFLOWS=true
    VALIDATE_SKILLS=true
    VALIDATE_TEMPLATES=true
fi

# If no specific validation requested, default to --all
if [[ "$VALIDATE_CODE" == false && "$VALIDATE_WORKFLOWS" == false && "$VALIDATE_SKILLS" == false && "$VALIDATE_TEMPLATES" == false ]]; then
    VALIDATE_ALL=true
    VALIDATE_CODE=true
    VALIDATE_WORKFLOWS=true
    VALIDATE_SKILLS=true
    VALIDATE_TEMPLATES=true
fi

echo -e "${BLUE}=== GSD Consolidated Validation ===${NC}"
echo "Environment: $(uname -s) $(uname -m)"
echo "Shell: $SHELL"
echo "Working Directory: $(pwd)"

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${BLUE}=== DRY RUN MODE ===${NC}"
fi

echo ""
# Function: Validate Code (from validate-universal.sh logic)
validate_code() {
    echo -e "${BLUE}=== Code Validation ===${NC}"
    
    if [[ "$DRY_RUN" == true ]]; then
        echo "Would validate: JavaScript, TypeScript, Python, Markdown, Shell scripts"
        return 0
    fi
    
    local code_errors=0
    
    # Tool availability detection
    local HAS_NODE=false
    local HAS_PYTHON=false
    local HAS_ESLINT=false
    local HAS_PYLINT=false
    
    command -v node >/dev/null 2>&1 && HAS_NODE=true
    command -v python >/dev/null 2>&1 && HAS_PYTHON=true
    command -v npx >/dev/null 2>&1 && npx eslint --version >/dev/null 2>&1 && HAS_ESLINT=true
    command -v pylint >/dev/null 2>&1 && HAS_PYLINT=true
    
    # JavaScript/TypeScript validation
    local JS_FILES=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v node_modules | head -20)
    if [[ -n "$JS_FILES" ]]; then
        echo "Validating JavaScript/TypeScript files..."
        if [[ "$HAS_ESLINT" == true ]]; then
            if npx eslint . --ext .js,.jsx,.ts,.tsx --ignore-path .gitignore 2>/dev/null; then
                echo -e "${GREEN}✓${NC} ESLint validation passed"
            else
                echo -e "${RED}✗${NC} ESLint validation failed"
                ((code_errors++))
            fi
        elif [[ "$HAS_NODE" == true ]]; then
            echo "ESLint not available, using basic Node.js syntax check..."
            while IFS= read -r file; do
                if [[ -n "$file" ]]; then
                    if node -c "$file" 2>/dev/null; then
                        echo -e "${GREEN}✓${NC} $file"
                    else
                        echo -e "${RED}✗${NC} $file - syntax error"
                        ((code_errors++))
                    fi
                fi
            done <<< "$JS_FILES"
        else
            echo -e "${YELLOW}⚠${NC} No JavaScript validation tools available"
        fi
    fi
    
    # Python validation
    local PY_FILES=$(find . -name "*.py" 2>/dev/null | grep -v __pycache__ | head -20)
    if [[ -n "$PY_FILES" ]]; then
        echo "Validating Python files..."
        if [[ "$HAS_PYLINT" == true ]]; then
            if pylint $PY_FILES 2>/dev/null; then
                echo -e "${GREEN}✓${NC} PyLint validation passed"
            else
                echo -e "${RED}✗${NC} PyLint validation failed"
                ((code_errors++))
            fi
        elif [[ "$HAS_PYTHON" == true ]]; then
            echo "PyLint not available, using basic Python syntax check..."
            while IFS= read -r file; do
                if [[ -n "$file" ]]; then
                    if python -m py_compile "$file" 2>/dev/null; then
                        echo -e "${GREEN}✓${NC} $file"
                    else
                        echo -e "${RED}✗${NC} $file - syntax error"
                        ((code_errors++))
                    fi
                fi
            done <<< "$PY_FILES"
        else
            echo -e "${YELLOW}⚠${NC} No Python validation tools available"
        fi
    fi
    
    # Shell script validation
    local SH_FILES=$(find . -name "*.sh" 2>/dev/null | head -10)
    if [[ -n "$SH_FILES" ]]; then
        echo "Validating shell scripts..."
        while IFS= read -r file; do
            if [[ -n "$file" ]]; then
                if bash -n "$file" 2>/dev/null; then
                    echo -e "${GREEN}✓${NC} $file"
                else
                    echo -e "${RED}✗${NC} $file - syntax error"
                    ((code_errors++))
                fi
            fi
        done <<< "$SH_FILES"
    fi
    
    TOTAL_ERRORS=$((TOTAL_ERRORS + code_errors))
    echo ""
}

# Function: Validate Workflows
validate_workflows() {
    echo -e "${BLUE}=== Workflow Validation ===${NC}"
    
    if [[ "$DRY_RUN" == true ]]; then
        echo "Would validate: .gsd/workflows/*.md files"
        return 0
    fi
    
    local workflow_errors=0
    local workflows_checked=0
    
    if [[ ! -d ".gsd/workflows" ]]; then
        echo -e "${YELLOW}⚠${NC} No .gsd/workflows directory found"
        return 0
    fi
    
    for file in .gsd/workflows/*.md; do
        if [[ -f "$file" ]]; then
            ((workflows_checked++))
            local filename=$(basename "$file")
            local has_errors=false
            
            # Check for frontmatter
            if ! head -1 "$file" | grep -q "^---"; then
                echo -e "${RED}✗${NC} $filename: Missing frontmatter"
                ((workflow_errors++))
                has_errors=true
            fi
            
            # Check for description
            if ! grep -q "description:" "$file"; then
                echo -e "${RED}✗${NC} $filename: Missing description in frontmatter"
                ((workflow_errors++))
                has_errors=true
            fi
            
            if [[ "$has_errors" == false ]]; then
                echo -e "${GREEN}✓${NC} $filename"
            fi
        fi
    done
    
    echo "Workflows checked: $workflows_checked, Errors: $workflow_errors"
    TOTAL_ERRORS=$((TOTAL_ERRORS + workflow_errors))
    echo ""
}
# Function: Validate Skills
validate_skills() {
    echo -e "${BLUE}=== Skills Validation ===${NC}"
    
    if [[ "$DRY_RUN" == true ]]; then
        echo "Would validate: .agent/skills/*/SKILL.md files"
        return 0
    fi
    
    local skill_errors=0
    local skills_checked=0
    
    if [[ ! -d ".agent/skills" ]]; then
        echo -e "${YELLOW}⚠${NC} No .agent/skills directory found"
        return 0
    fi
    
    for skill_dir in .agent/skills/*/; do
        if [[ -d "$skill_dir" ]]; then
            ((skills_checked++))
            local skill_name=$(basename "$skill_dir")
            local skill_file="$skill_dir/SKILL.md"
            local has_errors=false
            
            # Check SKILL.md exists
            if [[ ! -f "$skill_file" ]]; then
                echo -e "${RED}✗${NC} $skill_name: Missing SKILL.md"
                ((skill_errors++))
                continue
            fi
            
            # Check for frontmatter
            if ! head -1 "$skill_file" | grep -q "^---"; then
                echo -e "${RED}✗${NC} $skill_name: Missing frontmatter"
                ((skill_errors++))
                has_errors=true
            fi
            
            if [[ "$has_errors" == false ]]; then
                echo -e "${GREEN}✓${NC} $skill_name"
            fi
        fi
    done
    
    echo "Skills checked: $skills_checked, Errors: $skill_errors"
    TOTAL_ERRORS=$((TOTAL_ERRORS + skill_errors))
    echo ""
}

# Function: Validate Templates
validate_templates() {
    echo -e "${BLUE}=== Templates Validation ===${NC}"
    
    if [[ "$DRY_RUN" == true ]]; then
        echo "Would validate: .gsd/templates/*.md files"
        return 0
    fi
    
    local template_errors=0
    local templates_checked=0
    
    if [[ ! -d ".gsd/templates" ]]; then
        echo -e "${YELLOW}⚠${NC} No .gsd/templates directory found"
        return 0
    fi
    
    for file in .gsd/templates/*.md; do
        if [[ -f "$file" ]]; then
            ((templates_checked++))
            local filename=$(basename "$file")
            local has_errors=false
            
            # Check for title (# heading)
            if ! head -1 "$file" | grep -q "^# "; then
                echo -e "${RED}✗${NC} $filename: Missing title (# heading)"
                ((template_errors++))
                has_errors=true
            fi
            
            if [[ "$has_errors" == false ]]; then
                echo -e "${GREEN}✓${NC} $filename"
            fi
        fi
    done
    
    echo "Templates checked: $templates_checked, Errors: $template_errors"
    TOTAL_ERRORS=$((TOTAL_ERRORS + template_errors))
    echo ""
}

# Main execution
main() {
    if [[ "$VALIDATE_CODE" == true ]]; then
        validate_code
    fi
    
    if [[ "$VALIDATE_WORKFLOWS" == true ]]; then
        validate_workflows
    fi
    
    if [[ "$VALIDATE_SKILLS" == true ]]; then
        validate_skills
    fi
    
    if [[ "$VALIDATE_TEMPLATES" == true ]]; then
        validate_templates
    fi
    
    # Summary
    echo -e "${BLUE}=== Validation Summary ===${NC}"
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}ℹ${NC} Dry run completed - no actual validation performed"
    elif [[ $TOTAL_ERRORS -eq 0 ]]; then
        echo -e "${GREEN}✓${NC} All validations passed"
    else
        echo -e "${RED}✗${NC} Validation failed with $TOTAL_ERRORS error(s)"
    fi
    
    exit $TOTAL_ERRORS
}

# Run main function
main