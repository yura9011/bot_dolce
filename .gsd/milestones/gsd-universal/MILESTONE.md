---
milestone: gsd-universal
status: PLANNED
created_at: 2026-01-20
goal: Transform GSD into the first truly IDE-agnostic framework for AI development
---

# Milestone: GSD Universal

## Vision Statement

**Make GSD the universal standard for AI-assisted development, working seamlessly across ALL AI IDEs without modification.**

Transform GSD from "GSD for Kiro" to "GSD Universal" - a pure protocol that works identically in Kiro, Claude Code, Cursor, Windsurf, Antigravity, Codex, and any future AI IDE.

## The Problem

Currently, GSD depends on IDE-specific features:
- `getDiagnostics` (Kiro-specific syntax checking)
- `invokeSubAgent` (Kiro-specific parallel operations)  
- IDE-specific hooks, skills, powers
- Console-specific commands and validations

This creates **fundamental dependency** on specific tools, limiting true portability.

## The Solution

Create **GSD Pure Protocol** - a methodology that:
- Uses **ONLY** universal capabilities (file system, git, standard shell commands)
- Works with **ANY** AI assistant (human, Claude, GPT, Gemini, local models)
- Requires **NO** specific IDE, console, or tool dependencies
- Functions identically whether you're using Kiro, VS Code, Notepad, or just terminal + AI chat

**Core Principle**: If it requires a specific tool to work, it's not universal.

## Success Vision

**By completion:**
- GSD works with **any AI assistant** in **any environment**
- Zero dependencies on specific IDEs, consoles, or tools
- Works identically in terminal + ChatGPT as in Kiro as in VS Code + Copilot
- Pure methodology based on universal primitives (files, git, shell)

## Must-Haves

### Core Independence
- [ ] Zero dependencies on specific IDEs, consoles, or AI tools
- [ ] Works with any AI assistant (ChatGPT, Claude, Gemini, local models)
- [ ] Uses only universal primitives (files, git, standard shell commands)
- [ ] Identical behavior in any environment (terminal, IDE, web chat)

### Pure Protocol
- [ ] File-based state management (no tool-specific storage)
- [ ] Standard shell command validation (no getDiagnostics dependency)
- [ ] Git-based workflow tracking (no IDE-specific features)
- [ ] Markdown-based everything (no proprietary formats)

### Universal Ralph Loop
- [ ] Works without any specific AI CLI
- [ ] Self-contained prompt templates
- [ ] Standard file operations only
- [ ] Cross-platform shell compatibility

### Backward Compatibility
- [ ] Existing GSD projects work unchanged
- [ ] Current workflows remain functional
- [ ] Kiro optimizations available but optional
- [ ] Graceful degradation when tools unavailable

## Nice-to-Haves

- [ ] Tool-specific optimizations (when available)
- [ ] IDE integration helpers (optional enhancements)
- [ ] Web-based GSD interface
- [ ] Community plugin ecosystem
- [ ] Integration guides for popular tools

## Phases

### Phase 1: Pure Protocol Foundation
**Objective**: Remove ALL tool dependencies from GSD core

**Key Deliverables:**
- Standard shell command validation (replaces getDiagnostics)
- File-based parallel processing pattern (replaces invokeSubAgent)
- Universal file structure (no .kiro/, .claude/, etc. dependencies)
- Pure markdown workflow definitions

### Phase 2: Universal Ralph Loop
**Objective**: Make Ralph Loop completely self-contained

**Key Deliverables:**
- Prompt templates with no CLI dependencies
- Standard file operations only
- Cross-platform shell compatibility
- Self-executing within any environment

### Phase 3: Validation & Testing
**Objective**: Prove GSD works in any environment

**Key Deliverables:**
- Terminal + web chat testing
- Multiple editor + AI combinations
- Cross-platform validation
- Performance benchmarking

### Phase 4: Documentation & Migration
**Objective**: Enable adoption in any environment

**Key Deliverables:**
- GSD Pure Protocol specification
- Environment-agnostic setup guides
- Migration from tool-specific versions
- Community adoption toolkit

### Phase 5: Optimization Layer
**Objective**: Add optional tool-specific enhancements

**Key Deliverables:**
- Kiro optimization layer (optional)
- VS Code integration helpers (optional)
- IDE-specific shortcuts (optional)
- Performance optimizations (optional)

## Timeline

- **Phase 1**: 1 week (Core Protocol Abstraction)
- **Phase 2**: 1 week (Adapter System)
- **Phase 3**: 1 week (Ralph Universal)
- **Phase 4**: 1 week (Documentation & Migration)
- **Phase 5**: 2 weeks (Community & Ecosystem)

**Total**: ~6 weeks (Target: 2026-03-15)

## Success Metrics

### Technical Metrics
- GSD works identically in 5+ different AI IDEs
- Zero IDE-specific code in core GSD protocol
- 100% backward compatibility with existing projects
- <5 minute setup time in any new IDE

### Adoption Metrics
- Community adoption in 3+ different IDE ecosystems
- 10+ community contributions/adaptations
- Documentation translated to 3+ languages
- 95% user satisfaction across different IDEs

### Impact Metrics
- Becomes referenced standard for AI development methodology
- Reduces vendor lock-in for AI development teams
- Enables seamless IDE switching without workflow disruption
- Establishes GSD as platform-agnostic solution

## Dependencies

### Technical
- Complete understanding of common capabilities across AI IDEs
- Abstraction layer design for IDE-specific features
- Backward compatibility testing framework
- Multi-IDE testing environment

### Community
- Engagement with different IDE communities
- Documentation and tutorial creation
- Migration support for existing users
- Feedback collection and iteration

## Core Independence Challenges

### Technical Challenges

#### Validation Without Tool Dependencies
- **Challenge**: Replace `getDiagnostics` with standard shell commands
- **Solution**: Use language-specific linters via shell (eslint, pylint, etc.)
- **Fallback**: Basic syntax checking via compilation attempts

#### Parallel Processing Without invokeSubAgent
- **Challenge**: Coordinate multiple tasks without IDE-specific features
- **Solution**: File-based task queues and status tracking
- **Fallback**: Sequential execution with clear progress indicators

#### State Management Without Tool Storage
- **Challenge**: Maintain state without .kiro/, .claude/, etc. directories
- **Solution**: Pure markdown files with standardized formats
- **Fallback**: Git-based state tracking and recovery

### Environment Variations

#### Shell Compatibility
- **Challenge**: Different shells (bash, zsh, cmd, PowerShell) have different capabilities
- **Solution**: Cross-platform scripts with feature detection
- **Fallback**: Lowest common denominator commands

#### File System Differences
- **Challenge**: Path separators, permissions, case sensitivity vary
- **Solution**: Normalized path handling and permission checks
- **Fallback**: Clear error messages for unsupported operations

#### Git Availability
- **Challenge**: Not all environments have git installed
- **Solution**: Git availability detection and alternative workflows
- **Fallback**: Manual file-based versioning instructions

### AI Assistant Variations

#### Context Handling
- **Challenge**: Different AIs have different context limits and formats
- **Solution**: Modular prompts that work within any context limit
- **Fallback**: Progressive disclosure and context summarization

#### Capability Differences
- **Challenge**: Some AIs can't execute code, others can't access files
- **Solution**: Clear capability requirements and manual alternatives
- **Fallback**: Human-executable instructions for all operations

## Mitigation Strategy

### Core Principles
1. **Universal Primitives Only**: Files, git, standard shell commands
2. **Graceful Degradation**: Always provide manual alternatives
3. **Clear Requirements**: Document what's needed for each operation
4. **No Magic**: Every operation should be understandable and reproducible

### Implementation Approach
1. **Start Pure**: Build with zero dependencies first
2. **Add Optimizations**: Layer tool-specific improvements on top
3. **Test Everywhere**: Validate in minimal environments
4. **Document Everything**: Clear setup for any environment

## Revolutionary Impact

This milestone positions GSD to become:
- **The jQuery of AI development** - works everywhere, same API
- **The first truly portable AI methodology** - switch IDEs without changing workflow  
- **The community standard** - adopted across all AI IDE ecosystems
- **Future-proof foundation** - works with IDEs that don't exist yet

**This is our chance to create the first truly universal methodology for AI-assisted development - one that works everywhere, depends on nothing, and enables true freedom of choice.**