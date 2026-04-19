# GSD Universal Setup Guide

## Ralph Loop Setup

### Using Ralph with Different AI Assistants

**ChatGPT Web**:
1. Run `./scripts/ralph.sh build`
2. Copy the displayed prompt
3. Paste into ChatGPT web interface
4. Let ChatGPT execute the prompt
5. Press ENTER in terminal when done
6. Ralph runs validation and helps with commits

**Claude Web**:
- Same process as ChatGPT
- Copy prompt from terminal
- Paste into Claude web
- Execute and return to terminal

**Kiro IDE**:
- Run Ralph in Kiro's integrated terminal
- Copy prompt to Kiro chat
- Or use Kiro's AI features directly
- Return to terminal when done

**VS Code + Copilot**:
- Run Ralph in VS Code terminal
- Use Copilot chat with the prompt
- Or copy to external AI
- Return to terminal when done

**Terminal + Any AI**:
- Run Ralph in any terminal
- Copy prompt to your preferred AI
- Execute anywhere (web, mobile, etc.)
- Return to terminal when done

### Manual Execution

If you prefer full manual control:

```bash
# Just show prompts, no automation
./scripts/ralph.sh --manual
```

This displays prompts but doesn't run validation or git operations automatically.

### Troubleshooting

**Issue**: Validation fails
**Solution**: Fix the issues reported, then continue

**Issue**: Git conflicts
**Solution**: Resolve manually, then continue Ralph

**Issue**: Missing files
**Solution**: Run `./scripts/ralph.sh --dry-run` to identify what's missing

---

# GSD Universal Setup Guide

## Overview

GSD Universal works in **any environment** with **any AI assistant** using only standard tools. This guide shows you how to set up GSD in your preferred environment.

## Core Requirements

### Essential (Required)
- **Git**: Version control and state management
- **Text Editor**: Any editor (nano, vim, VS Code, Notepad, web editor)
- **Shell Access**: Command line (bash, PowerShell, cmd, or terminal)
- **AI Assistant**: Any AI (Claude, ChatGPT, Gemini, local models, or human)

### Optional (Enhanced Experience)
- **Language Linters**: eslint, pylint, tsc (with fallbacks when unavailable)
- **Node.js**: For JavaScript/TypeScript projects
- **Python**: For Python projects
- **Package Managers**: npm, pip, etc. (project-specific)

## Quick Start (5 Minutes)

### 1. Verify Prerequisites
```bash
# Check git is available
git --version

# Check you can create/edit files
echo "test" > test.txt && rm test.txt

# Check shell works
echo "Shell working: $(pwd)"
```

### 2. Initialize GSD Universal
```bash
# Clone or download GSD Universal
git clone <gsd-universal-repo> my-project
cd my-project

# Or start fresh project
mkdir my-project && cd my-project
git init
```

### 3. Verify Setup
```bash
# Test universal validation
./scripts/validate-universal.ps1 -DryRun  # Windows
# or
./scripts/validate-universal.sh --dry-run  # Linux/Mac

# Should show: "Universal validation script is ready to use"
```

### 4. Start Your First Project
```
# With any AI assistant, run:
/new-project

# Follow the guided setup process
```

## Environment-Specific Setup

### Terminal + AI Chat (ChatGPT, Claude Web, etc.)

**Perfect for**: Quick projects, learning GSD, environments without IDE

**Setup Steps**:
1. Open terminal in your project directory
2. Have AI chat open in browser/app
3. Copy-paste commands between terminal and AI chat
4. Edit files with your preferred text editor

**Workflow**:
```bash
# In terminal
cd my-project
ls -la .gsd/

# Copy output to AI chat, then AI responds with next steps
# Copy AI's commands back to terminal
git status
```

**Tips**:
- Use `cat filename.md` to show file contents to AI
- Copy-paste file contents when AI needs to read them
- Use `git log --oneline` to show project history to AI

### Kiro IDE

**Perfect for**: Full-featured development with AI integration

**Setup Steps**:
1. Open project in Kiro
2. GSD Universal works immediately (no special setup needed)
3. Use Kiro's built-in AI for GSD commands
4. Leverage Kiro's file management and git integration

**Enhanced Features**:
- File tree navigation for easy .gsd/ exploration
- Integrated terminal for validation scripts
- Git integration for atomic commits
- Multi-file editing for task coordination

**Workflow**:
```
# In Kiro chat
/new-project

# Kiro handles file operations automatically
# Use file tree to navigate .gsd/ structure
# Use integrated terminal for validation
```

### VS Code + AI Extensions

**Perfect for**: Developers who prefer VS Code with AI assistance

**Setup Steps**:
1. Open project in VS Code
2. Install AI extension (GitHub Copilot, Claude Code, etc.)
3. Use VS Code terminal for shell commands
4. Edit GSD files using VS Code's markdown support

**Enhanced Features**:
- Markdown preview for .gsd/ documentation
- Integrated git for atomic commits
- File explorer for .gsd/ navigation
- Terminal integration for validation scripts

**Workflow**:
```bash
# In VS Code terminal
./scripts/validate-universal.ps1

# Use AI extension for GSD guidance
# Edit files in VS Code editor
# Use git integration for commits
```
### Web-Based Environments (GitHub Codespaces, Replit, etc.)

**Perfect for**: Cloud development, no local setup required

**Setup Steps**:
1. Create new repository or codespace
2. Upload/clone GSD Universal files
3. Use web terminal for shell commands
4. Edit files using web editor

**Limitations & Workarounds**:
- Limited shell access → Use git commits for state tracking
- No local file system → Use git for all persistence
- Restricted tools → Use manual validation checklists

**Workflow**:
```bash
# In web terminal
git status
cat .gsd/ROADMAP.md

# Use web editor for file modifications
# Commit frequently to preserve state
git add . && git commit -m "Update project state"
```

## Migration from IDE-Specific GSD

### From Kiro GSD
```bash
# Backup existing Kiro setup
mkdir -p .gsd/legacy/kiro/
cp -r .kiro/ .gsd/legacy/kiro/ 2>/dev/null || true

# GSD Universal works immediately
# Your existing .gsd/ files are already compatible
# No migration needed for core GSD files
```

### From Claude Code GSD
```bash
# Backup existing Claude setup
mkdir -p .gsd/legacy/claude/
cp -r .claude/ .gsd/legacy/claude/ 2>/dev/null || true

# Review and adapt any custom configurations
# Core GSD workflows work universally
```

### From Other AI IDEs
```bash
# General migration pattern
mkdir -p .gsd/legacy/{ide-name}/
cp -r .{ide-name}/ .gsd/legacy/{ide-name}/ 2>/dev/null || true

# Extract universal patterns from IDE-specific configs
# Adapt to universal protocols in .gsd/protocols/
```

## Troubleshooting

### "Command not found" errors
```bash
# Check if command exists
command -v git >/dev/null 2>&1 && echo "Git available" || echo "Git missing"

# Install missing tools or use manual alternatives
# See .gsd/protocols/validation.md for fallback methods
```

### "Permission denied" errors
```bash
# Make scripts executable (Linux/Mac)
chmod +x scripts/validate-universal.sh

# Use PowerShell on Windows
./scripts/validate-universal.ps1
```

### "No such file or directory"
```bash
# Verify you're in project root
ls -la .gsd/

# Initialize GSD structure if missing
mkdir -p .gsd/protocols .gsd/lib .gsd/workflows
```
## Verification Steps

### 1. Structure Check
```bash
# Verify GSD Universal structure exists
test -d .gsd && echo "✓ GSD system directory"
test -f .gsd/protocols/validation.md && echo "✓ Universal validation protocol"
test -f .gsd/protocols/parallel.md && echo "✓ Universal parallel processing"
test -f .gsd/protocols/file-structure.md && echo "✓ Universal file structure"
```

### 2. Validation Check
```bash
# Test universal validation works
./scripts/validate-universal.ps1 -DryRun  # Windows
./scripts/validate-universal.sh --dry-run  # Linux/Mac

# Should show tool availability and validation readiness
```

### 3. Git Check
```bash
# Verify git operations work
git status
git log --oneline -5

# Should show clean working directory and commit history
```

### 4. AI Integration Check
```
# With your AI assistant, try:
/help

# Should show GSD commands and workflows
# If not, ensure you're in a directory with .gsd/ folder
```

## Best Practices

### File Management
- Keep all GSD files in `.gsd/` directory
- Use standard project files (README.md, SPEC.md, etc.) in root
- Commit frequently with descriptive messages
- Use UTF-8 encoding and LF line endings

### Cross-Platform Compatibility
- Test scripts on your target platforms
- Use relative paths in all references
- Avoid platform-specific commands in documentation
- Provide both bash and PowerShell examples

### AI Assistant Integration
- Start commands with `/` for GSD workflows
- Provide context by showing relevant files
- Use `cat filename.md` to share file contents
- Keep AI informed of current project state

## Getting Help

### Documentation
- `.gsd/COMMANDS.md` - All available GSD commands
- `.gsd/workflows/` - Detailed workflow definitions
- `.gsd/protocols/` - Universal protocol specifications
- `.gsd/examples/` - Usage examples and patterns

### Community Resources
- GSD Universal GitHub repository
- Community discussions and examples
- Migration guides and best practices
- Troubleshooting and FAQ

## Success Criteria

Your GSD Universal setup is complete when:
- ✅ Universal validation script runs successfully
- ✅ You can create and edit files in `.gsd/` directory
- ✅ Git operations work (status, add, commit)
- ✅ Your AI assistant responds to `/help` command
- ✅ You can run `/new-project` to start a new project

**Welcome to GSD Universal - the first truly portable AI development methodology!**