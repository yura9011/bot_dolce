# User Experience Analysis - New User Perspective

**Date**: 2026-01-21  
**Purpose**: Identify blind spots in GSD onboarding and usage

---

## Scenario 1: Complete Beginner (Never Used GSD)

### What They See First
1. **GitHub Repository** - README.md
2. **Overwhelming**: 25 workflows, protocols, templates
3. **Question**: "Where do I even start?"

### Current Experience
```
User: "I want to try GSD"
→ Clones repo
→ Sees .gsd/, scripts/, loop.sh, PROMPT_*.md
→ Reads README
→ README says: "Read .gsd/workflows/new-project.md"
→ Opens file, sees 200+ lines of instructions
→ Confused: "Do I copy-paste this to my AI?"
```

### Problems Identified
1. **No Quick Start Guide** - README has installation, but not "first 5 minutes"
2. **Unclear AI Interaction** - How exactly do I "read a workflow"?
3. **No Examples** - What does a GSD session actually look like?
4. **Too Many Files** - Which ones matter for getting started?

### What's Missing
- [ ] `QUICKSTART.md` - Literal step-by-step for first use
- [ ] `EXAMPLES.md` - Real session transcripts
- [ ] Video/GIF showing actual usage
- [ ] "Hello World" equivalent for GSD

---

## Scenario 2: Existing Project (Brownfield)

### What They Want
"I have a React app with 50 files. I want to use GSD to add a new feature."

### Current Experience
```
User: "I'll add GSD to my project"
→ Copies .gsd/ folder to project
→ Now what?
→ README says: "Read .gsd/workflows/new-project.md"
→ But I already have a project!
→ Tries /map workflow
→ Workflow says: "Run these bash commands"
→ Runs commands manually
→ Gets output
→ Now what? Where do I put this?
```

### Problems Identified
1. **No Brownfield Guide** - All docs assume greenfield
2. **Unclear File Creation** - Where does ARCHITECTURE.md go?
3. **Existing Files Conflict** - What if I already have README.md?
4. **No Migration Path** - How to adopt GSD incrementally?

### What's Missing
- [ ] `BROWNFIELD-SETUP.md` - Guide for existing projects
- [ ] Checklist: "Do you have SPEC.md? No? Create it first"
- [ ] Examples of GSD in real codebases
- [ ] "Minimal GSD" - What's the absolute minimum to start?

---

## Scenario 3: Different AI Assistants

### ChatGPT Web User
```
User: "I'll use GSD with ChatGPT"
→ Copies .gsd/ to project
→ Opens ChatGPT web
→ Pastes workflow content
→ ChatGPT: "I can't access your files"
→ User: "Oh... how do I give it context?"
→ Manually copies file contents
→ This is tedious...
```

**Problem**: Workflows assume AI can read files. ChatGPT web can't.

### Claude Web User
```
User: "I'll use GSD with Claude"
→ Same problem as ChatGPT
→ Plus: Claude has conversation limits
→ Long workflows get cut off
```

**Problem**: No guidance for web-based AI limitations.

### Terminal + AI User
```
User: "I'll use GSD in terminal"
→ Runs loop.sh
→ Script shows prompt
→ User copies to AI
→ AI responds
→ User: "Now what? Do I paste response back?"
→ Script is waiting for ENTER
→ User presses ENTER
→ Script runs validation
→ Validation fails (no changes made yet)
→ User confused
```

**Problem**: Ralph Loop assumes user knows the flow.

### What's Missing
- [ ] `AI-SPECIFIC-GUIDES.md` - How to use with each AI
- [ ] ChatGPT guide: "You'll need to copy file contents manually"
- [ ] Claude guide: "Break workflows into smaller chunks"
- [ ] Terminal guide: "Here's the exact flow"
- [ ] Kiro guide: "You can use file references"

---

## Scenario 4: First Workflow Execution

### User Tries `/new-project` (or reads workflow)
```
User: Opens .gsd/workflows/new-project.md
→ Sees: "<objective>", "<context>", "<process>"
→ Question: "Do I copy all of this to my AI?"
→ Or just the <process> section?
→ Tries copying everything
→ AI gets confused by XML-like tags
```

### User Tries `/map`
```
User: Reads .gsd/workflows/map.md
→ Sees bash commands
→ Question: "Do I run these myself or does AI run them?"
→ Tries running manually
→ Gets output
→ Question: "Now what? Do I paste this back to AI?"
→ No clear next step
```

### Problems Identified
1. **Workflow Format Unclear** - What parts are for AI vs human?
2. **No Execution Examples** - Show actual usage
3. **Missing Feedback Loop** - What happens after each step?
4. **No Error Handling** - What if something fails?

### What's Missing
- [ ] Workflow execution guide
- [ ] Clear markers: "COPY THIS TO AI" vs "RUN THIS YOURSELF"
- [ ] Example sessions showing full flow
- [ ] Troubleshooting section in each workflow

---

## Scenario 5: Ralph Loop Confusion

### User Tries Ralph Loop
```
User: Runs ./loop.sh build
→ Script shows PROMPT_build.md content
→ User: "Okay, I see the prompt"
→ Script: "Execute this prompt with your AI assistant, then press ENTER"
→ User copies to AI
→ AI responds with code changes
→ User: "Do I apply these changes myself?"
→ User applies changes manually
→ Presses ENTER
→ Script runs validation
→ Validation passes
→ Script: "Commit? (y/n)"
→ User: "Wait, what should the commit message be?"
```

### Problems Identified
1. **Unclear User Actions** - What exactly should user do?
2. **No Guidance on AI Response** - How to handle AI output?
3. **Manual File Editing** - User must apply changes themselves
4. **Commit Message** - No guidance on format

### What's Missing
- [ ] Ralph Loop tutorial
- [ ] Step-by-step first iteration guide
- [ ] Video/GIF of Ralph Loop in action
- [ ] Common issues and solutions

---

## Scenario 6: File Structure Confusion

### User Explores Project
```
User: Looks at file structure
→ Sees: .gsd/, scripts/, specs/, loop.sh, PROMPT_*.md
→ Question: "What's the difference between .gsd/workflows/ and loop.sh?"
→ Question: "Do I need scripts/ if I'm using ChatGPT web?"
→ Question: "What's in .gsd/milestones/? Do I need this?"
→ Question: "Why are there .gsd/phases/ AND .gsd/milestones/?"
```

### Problems Identified
1. **Too Many Directories** - Unclear purpose of each
2. **Legacy Files** - .gsd/phases/ looks like duplicate
3. **Optional vs Required** - What can I delete?
4. **No File Structure Guide** - What's essential?

### What's Missing
- [ ] `FILE-STRUCTURE.md` - Explain every directory
- [ ] Mark optional directories clearly
- [ ] "Minimal GSD" - Just the essentials
- [ ] Cleanup guide for legacy files

---

## Scenario 7: Validation Confusion

### User Tries Validation
```
User: Reads AGENTS.md
→ Sees: "./scripts/validate.ps1 -All"
→ Runs command
→ Output: "Validating workflows... OK"
→ User: "What did it validate?"
→ User: "Did it check my code?"
→ User: "What if I don't have eslint installed?"
```

### Problems Identified
1. **Unclear What's Validated** - Code? Workflows? Structure?
2. **No Output Explanation** - What does "OK" mean?
3. **Missing Dependencies** - What if linters not installed?
4. **No Validation Guide** - When to run validation?

### What's Missing
- [ ] Validation guide explaining what's checked
- [ ] Clear output with details
- [ ] Dependency checker
- [ ] "Validation failed" troubleshooting

---

## Scenario 8: Cross-Platform Issues

### Windows User
```
User: Windows with PowerShell
→ Tries: ./loop.sh
→ Error: "bash: command not found"
→ User: "Oh, I need to use .ps1"
→ Tries: ./loop.ps1
→ Works!
→ But: Some workflows reference bash commands
→ User: "Do I translate these to PowerShell?"
```

### Mac/Linux User
```
User: Mac with bash
→ Tries: ./loop.sh
→ Works!
→ But: Some docs mention .ps1 files
→ User: "Do I need PowerShell?"
```

### Problems Identified
1. **Platform-Specific Instructions** - Not always clear
2. **Mixed Command Examples** - Bash and PowerShell mixed
3. **No Platform Detection** - Scripts don't auto-detect
4. **Confusing Documentation** - Shows both platforms always

### What's Missing
- [ ] Platform-specific quick starts
- [ ] Auto-detection in scripts
- [ ] Clear "Windows users: use .ps1" markers
- [ ] Separate platform guides

---

## Scenario 9: Git Integration Confusion

### User Without Git Experience
```
User: New to Git
→ Ralph Loop: "Commit? (y/n)"
→ User: "What's a commit?"
→ User: "What should I write?"
→ User: "Can I undo this?"
```

### User With Git Experience
```
User: Experienced with Git
→ Ralph Loop creates commits
→ User: "Wait, I want to review changes first"
→ User: "I want to amend the commit message"
→ User: "I want to squash these commits"
```

### Problems Identified
1. **Assumes Git Knowledge** - No Git basics
2. **No Commit Review** - Can't see diff before commit
3. **No Commit Editing** - Can't change message
4. **Atomic Commits** - User might want different strategy

### What's Missing
- [ ] Git basics guide
- [ ] Commit review step
- [ ] Commit message templates
- [ ] Git workflow customization

---

## Scenario 10: Documentation Overload

### User Tries to Learn GSD
```
User: "I'll read the docs"
→ Sees: .gsd/SYSTEM.md (huge)
→ Sees: .gsd/COMMANDS.md (25 commands)
→ Sees: .gsd/workflows/ (25 files)
→ Sees: .gsd/protocols/ (5 files)
→ Sees: .gsd/templates/ (20+ files)
→ User: "This is overwhelming"
→ User: "Where do I start?"
```

### Problems Identified
1. **Too Much Documentation** - No clear entry point
2. **No Learning Path** - What order to read?
3. **No Priorities** - What's essential vs optional?
4. **No Progressive Disclosure** - Everything at once

### What's Missing
- [ ] `LEARNING-PATH.md` - Ordered reading list
- [ ] "Start Here" guide
- [ ] Essential vs Advanced docs
- [ ] Video tutorials
- [ ] Interactive tutorial

---

## Critical Blind Spots Identified

### 1. Onboarding Gap
**Problem**: No clear "first 5 minutes" experience
**Impact**: High - Users give up immediately
**Solution**: Create QUICKSTART.md with literal steps

### 2. AI Interaction Unclear
**Problem**: Users don't know HOW to use workflows with AI
**Impact**: Critical - Core functionality unclear
**Solution**: Show actual examples, not just instructions

### 3. Brownfield Adoption
**Problem**: All docs assume new project
**Impact**: High - Most users have existing projects
**Solution**: Create brownfield setup guide

### 4. Platform-Specific Confusion
**Problem**: Mixed bash/PowerShell instructions
**Impact**: Medium - Users get confused
**Solution**: Platform-specific guides

### 5. Ralph Loop Mystery
**Problem**: Users don't understand the flow
**Impact**: High - Key feature unusable
**Solution**: Step-by-step tutorial with examples

### 6. File Structure Confusion
**Problem**: Too many directories, unclear purpose
**Impact**: Medium - Users feel lost
**Solution**: Explain every directory, mark optional

### 7. Validation Mystery
**Problem**: Users don't know what's validated
**Impact**: Low - Feature works but unclear
**Solution**: Better output and documentation

### 8. Documentation Overload
**Problem**: Too much to read, no entry point
**Impact**: High - Users overwhelmed
**Solution**: Learning path and progressive disclosure

### 9. No Examples
**Problem**: All theory, no practice
**Impact**: Critical - Users can't visualize usage
**Solution**: Real session transcripts, videos

### 10. Git Assumptions
**Problem**: Assumes Git knowledge
**Impact**: Medium - Blocks some users
**Solution**: Git basics guide

---

## Recommended Immediate Actions

### Priority 1: Critical (Do Now)
1. **Create QUICKSTART.md** - 5-minute getting started
2. **Add Usage Examples** - Real session transcripts
3. **Create Brownfield Guide** - For existing projects
4. **Ralph Loop Tutorial** - Step-by-step first iteration

### Priority 2: High (Do Soon)
5. **AI-Specific Guides** - ChatGPT, Claude, Kiro, etc.
6. **File Structure Guide** - Explain every directory
7. **Learning Path** - Ordered documentation
8. **Platform Guides** - Windows vs Mac/Linux

### Priority 3: Medium (Nice to Have)
9. **Video Tutorials** - Show actual usage
10. **Git Basics Guide** - For beginners
11. **Troubleshooting Guide** - Common issues
12. **Minimal GSD** - Absolute essentials only

---

## User Journey Map

### Ideal First Experience
```
1. User finds GSD on GitHub
2. README has clear "Quick Start" section
3. User follows 5 steps:
   a. Clone repo
   b. Copy to project
   c. Read QUICKSTART.md
   d. Follow first example
   e. Success!
4. User explores more workflows
5. User becomes productive
```

### Current First Experience
```
1. User finds GSD on GitHub
2. README has installation instructions
3. User copies files
4. User reads workflows
5. User confused about how to use
6. User gives up or asks for help
```

---

## Conclusion

**Main Issues**:
1. No clear onboarding path
2. Unclear how to interact with AI
3. No examples of actual usage
4. Documentation overload
5. Brownfield adoption unclear

**Impact**: High - Users can't get started easily

**Solution**: Create onboarding materials focused on "first 5 minutes" experience with real examples.

---

## Comparison with Original Implementations

**Analysis Date**: 2026-01-21

After comparing GSD Universal with:
1. Original GSD (glittercowboy/get-shit-done)
2. Ralph Loop Methodology (ClaytonFarr/ralph-playbook)

### Key Findings

**[OK] Core Functionality**: All essential workflows present and working correctly.

**[OK] Universality Achieved**: Successfully removed all IDE dependencies.

**[CRITICAL] Documentation Gap**: Original implementations have much better onboarding.

### What Original GSD Does Better

1. **Installation Guide**: Clear step-by-step installation
2. **Getting Started**: Immediate "verify with /gsd:help" instruction
3. **Command Reference**: Complete list with descriptions
4. **Brownfield Support**: Explicit `/gsd:map-codebase` command
5. **Troubleshooting Section**: Common issues and solutions
6. **Visual Elements**: Star history chart, quotes, badges

### What Ralph Playbook Does Better

1. **Conceptual Explanation**: Clear "3 Phases, 2 Prompts, 1 Loop"
2. **Workflow Diagram**: Visual representation of process
3. **Detailed Examples**: Real prompt templates with annotations
4. **Key Principles**: Explicit philosophy and reasoning
5. **Loop Mechanics**: Detailed explanation of how it works
6. **File Structure**: Clear purpose of each file

### What We Need to Add

**Priority 1: Critical**
1. QUICKSTART.md - 5-minute getting started (like original GSD)
2. Usage examples - Real session transcripts (like Ralph Playbook)
3. Brownfield guide - Existing project adoption
4. AI-specific guides - ChatGPT, Claude, Kiro usage

**Priority 2: High**
5. Workflow diagrams - Visual representation (like Ralph Playbook)
6. Conceptual explanation - "How GSD Universal works"
7. Video tutorials - Screen recordings
8. Troubleshooting guide - Common issues

**Priority 3: Medium**
9. Learning path - Ordered documentation
10. Success stories - Real project examples
11. FAQ - Common questions
12. Comparison table - When to use what

### Validation of Our Blind Spots

The comparison confirms our blind spot analysis was accurate:

- [CONFIRMED] No Quick Start Guide
- [CONFIRMED] Unclear AI Interaction
- [CONFIRMED] No Examples
- [CONFIRMED] No Brownfield Guide
- [CONFIRMED] Documentation Overload
- [CONFIRMED] No Visual Aids

**Verdict**: Our analysis was correct. The missing pieces are exactly what original implementations provide.

**Next Action**: Focus on documentation, not features. The system works - we just need to teach people how to use it.

See `.gsd/archive/COMPARISON-WITH-ORIGINALS.md` for detailed analysis.
