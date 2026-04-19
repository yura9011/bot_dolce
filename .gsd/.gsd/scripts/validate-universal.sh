#!/bin/bash
# Universal Validation Script - Works in any environment with any AI assistant
# Part of GSD Universal Protocol

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

# Global exit code
EXIT_CODE=0

# Dry run flag
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${BLUE}=== DRY RUN MODE ===${NC}"
fi

echo -e "${BLUE}=== GSD Universal Validation ===${NC}"
echo "Environment: $(uname -s) $(uname -m)"
echo "Shell: $SHELL"
echo "Working Directory: $(pwd)"
echo ""

# Tool availability detection
echo -e "${BLUE}=== Tool Availability Check ===${NC}"
HAS_NODE=false
HAS_PYTHON=false
HAS_ESLINT=false
HAS_PYLINT=false
HAS_TSC=false
HAS_MARKDOWNLINT=false

if command -v node >/dev/null 2>&1; then
    HAS_NODE=true
    echo -e "${GREEN}✓${NC} Node.js available ($(node --version))"
else
    echo -e "${YELLOW}✗${NC} Node.js not found"
fi

if command -v python >/dev/null 2>&1; then
    HAS_PYTHON=true
    echo -e "${GREEN}✓${NC} Python available ($(python --version 2>&1))"
elif command -v python3 >/dev/null 2>&1; then
    HAS_PYTHON=true
    echo -e "${GREEN}✓${NC} Python3 available ($(python3 --version))"
    alias python=python3
else
    echo -e "${YELLOW}✗${NC} Python not found"
fi

if command -v npx >/dev/null 2>&1 && npx eslint --version >/dev/null 2>&1; then
    HAS_ESLINT=true
    echo -e "${GREEN}✓${NC} ESLint available ($(npx eslint --version))"
else
    echo -e "${YELLOW}✗${NC} ESLint not found"
fi

if command -v pylint >/dev/null 2>&1; then
    HAS_PYLINT=true
    echo -e "${GREEN}✓${NC} PyLint available ($(pylint --version | head -n1))"
else
    echo -e "${YELLOW}✗${NC} PyLint not found"
fi

if command -v npx >/dev/null 2>&1 && npx tsc --version >/dev/null 2>&1; then
    HAS_TSC=true
    echo -e "${GREEN}✓${NC} TypeScript available ($(npx tsc --version))"
else
    echo -e "${YELLOW}✗${NC} TypeScript not found"
fi

if command -v markdownlint >/dev/null 2>&1; then
    HAS_MARKDOWNLINT=true
    echo -e "${GREEN}✓${NC} MarkdownLint available"
else
    echo -e "${YELLOW}✗${NC} MarkdownLint not found"
fi

echo ""

# JavaScript/TypeScript validation
JS_FILES=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v node_modules | head -20)
if [[ -n "$JS_FILES" ]]; then
    echo -e "${BLUE}=== JavaScript/TypeScript Validation ===${NC}"
    
    if [[ "$HAS_ESLINT" == true ]]; then
        echo "Running ESLint..."
        if [[ "$DRY_RUN" == false ]]; then
            if npx eslint . --ext .js,.jsx,.ts,.tsx --ignore-path .gitignore 2>/dev/null; then
                echo -e "${GREEN}✓${NC} ESLint validation passed"
            else
                echo -e "${RED}✗${NC} ESLint validation failed"
                EXIT_CODE=1
            fi
        else
            echo "Would run: npx eslint . --ext .js,.jsx,.ts,.tsx"
        fi
    elif [[ "$HAS_NODE" == true ]]; then
        echo "ESLint not available, using basic Node.js syntax check..."
        if [[ "$DRY_RUN" == false ]]; then
            while IFS= read -r file; do
                if [[ -n "$file" ]]; then
                    if node -c "$file" 2>/dev/null; then
                        echo -e "${GREEN}✓${NC} $file"
                    else
                        echo -e "${RED}✗${NC} $file - syntax error"
                        EXIT_CODE=1
                    fi
                fi
            done <<< "$JS_FILES"
        else
            echo "Would check syntax for JS/TS files using Node.js"
        fi
    else
        echo -e "${YELLOW}⚠${NC} No JavaScript validation tools available"
        echo "Manual verification required:"
        echo "  - Check balanced braces, brackets, parentheses"
        echo "  - Verify semicolons and commas"
        echo "  - Confirm import/export syntax"
    fi
    echo ""
fi

# Python validation
PY_FILES=$(find . -name "*.py" 2>/dev/null | grep -v __pycache__ | head -20)
if [[ -n "$PY_FILES" ]]; then
    echo -e "${BLUE}=== Python Validation ===${NC}"
    
    if [[ "$HAS_PYLINT" == true ]]; then
        echo "Running PyLint..."
        if [[ "$DRY_RUN" == false ]]; then
            if pylint $PY_FILES 2>/dev/null; then
                echo -e "${GREEN}✓${NC} PyLint validation passed"
            else
                echo -e "${RED}✗${NC} PyLint validation failed"
                EXIT_CODE=1
            fi
        else
            echo "Would run: pylint on Python files"
        fi
    elif [[ "$HAS_PYTHON" == true ]]; then
        echo "PyLint not available, using basic Python syntax check..."
        if [[ "$DRY_RUN" == false ]]; then
            while IFS= read -r file; do
                if [[ -n "$file" ]]; then
                    if python -m py_compile "$file" 2>/dev/null; then
                        echo -e "${GREEN}✓${NC} $file"
                    else
                        echo -e "${RED}✗${NC} $file - syntax error"
                        EXIT_CODE=1
                    fi
                fi
            done <<< "$PY_FILES"
        else
            echo "Would check syntax for Python files"
        fi
    else
        echo -e "${YELLOW}⚠${NC} No Python validation tools available"
        echo "Manual verification required:"
        echo "  - Check indentation consistency"
        echo "  - Verify colon placement after if/for/def/class"
        echo "  - Confirm parentheses matching"
    fi
    echo ""
fi

# Markdown validation
MD_FILES=$(find . -name "*.md" 2>/dev/null | head -20)
if [[ -n "$MD_FILES" ]]; then
    echo -e "${BLUE}=== Markdown Validation ===${NC}"
    
    if [[ "$HAS_MARKDOWNLINT" == true ]]; then
        echo "Running MarkdownLint..."
        if [[ "$DRY_RUN" == false ]]; then
            if markdownlint $MD_FILES 2>/dev/null; then
                echo -e "${GREEN}✓${NC} MarkdownLint validation passed"
            else
                echo -e "${RED}✗${NC} MarkdownLint validation failed"
                EXIT_CODE=1
            fi
        else
            echo "Would run: markdownlint on Markdown files"
        fi
    else
        echo "MarkdownLint not available, using basic validation..."
        if [[ "$DRY_RUN" == false ]]; then
            while IFS= read -r file; do
                if [[ -n "$file" ]]; then
                    # Basic markdown validation
                    if [[ -f "$file" && -r "$file" ]]; then
                        echo -e "${GREEN}✓${NC} $file - readable"
                    else
                        echo -e "${RED}✗${NC} $file - not readable"
                        EXIT_CODE=1
                    fi
                fi
            done <<< "$MD_FILES"
        else
            echo "Would check basic Markdown file readability"
        fi
        echo -e "${YELLOW}💡${NC} Manual verification recommended:"
        echo "  - Check link syntax [text](url)"
        echo "  - Verify header hierarchy (# ## ###)"
        echo "  - Confirm code block formatting"
    fi
    echo ""
fi

# Shell script validation
SH_FILES=$(find . -name "*.sh" 2>/dev/null | head -10)
if [[ -n "$SH_FILES" ]]; then
    echo -e "${BLUE}=== Shell Script Validation ===${NC}"
    
    if [[ "$DRY_RUN" == false ]]; then
        while IFS= read -r file; do
            if [[ -n "$file" ]]; then
                if bash -n "$file" 2>/dev/null; then
                    echo -e "${GREEN}✓${NC} $file"
                else
                    echo -e "${RED}✗${NC} $file - syntax error"
                    EXIT_CODE=1
                fi
            fi
        done <<< "$SH_FILES"
    else
        echo "Would check syntax for shell scripts using bash -n"
    fi
    echo ""
fi

# Summary
echo -e "${BLUE}=== Validation Summary ===${NC}"
if [[ "$DRY_RUN" == true ]]; then
    echo -e "${BLUE}ℹ${NC} Dry run completed - no actual validation performed"
    echo "Universal validation script is ready to use"
elif [[ $EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}✓${NC} All validations passed"
    echo "Code quality verification complete"
else
    echo -e "${RED}✗${NC} Validation failed with $EXIT_CODE error(s)"
    echo "Please fix issues and re-run validation"
fi

echo ""
echo -e "${BLUE}💡 Tip:${NC} Install additional tools for enhanced validation:"
echo "  npm install -g eslint @typescript-eslint/parser"
echo "  pip install pylint"
echo "  npm install -g markdownlint-cli"

exit $EXIT_CODE