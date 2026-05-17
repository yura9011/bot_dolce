# AGENTS.md

> Operating rules for coding agents working on this repository.
> Read this before planning or editing.

## Project Context

This is a WhatsApp bot platform for Dolce Party. The current production system runs on a Hostinger VPS with PM2.

Current architecture:

- `bot_dolce` on VPS: real production. Santa Ana data is real and must be protected.
- `bot_testing` on VPS: testing environment.
- Local Windows repo: newer code and planning state.
- Current repo direction: multi-agent is working; multi-tenant work begins with a new Dashboard Maestro app.

## Source Of Truth

Read in this order:

1. `.gsd/state/IMPLEMENTATION_PLAN.md`
2. `.gsd/STATE.md`
3. `.gsd/milestones/multi-tenant-architecture/README.md`
4. `.gsd/milestones/multi-tenant-architecture/CURRENT_DECISIONS.md`
5. This file

If documents conflict, the newest current GSD milestone docs win over archived docs.

## Protected Runtime Data

Do not touch runtime data unless the user explicitly asks and a backup exists.

Protected per-agent runtime package:

- `data/**/historial.json`
- `data/**/pausas.json`
- `data/**/admin-numbers.json`
- `.wwebjs_auth/`
- `.wwebjs_cache/`
- `logs/`
- production config currently used by the VPS

Never overwrite, normalize, delete, move, or regenerate those files as part of cleanup.

## Current Product Direction

Build Dashboard Maestro as a new app:

```text
multi-tenant/dashboard-maestro/
```

It may eventually replace `dashboard-central.js`, but not until it is tested and approved.

Production remains stable. Test in `bot_testing` first. Migration is a later phase.

## Rule 1 - Think Before Coding

State assumptions explicitly. Ask rather than guess.

Push back when a simpler approach exists. Stop when confused.

Before coding, define:

- What problem is being solved.
- What files are likely involved.
- What is explicitly out of scope.
- What would prove the change worked.

## Rule 2 - Simplicity First

Write the minimum code that solves the problem. Nothing speculative.

No abstractions for single-use code.

Prefer existing project patterns:

- Express + Socket.IO for dashboards.
- Vanilla JS/CSS for current frontends.
- JSON storage until SQLite migration is explicitly planned.
- Small modules over framework rewrites.

## Rule 3 - Surgical Changes

Touch only what you must. Do not improve adjacent code.

Match existing style. Do not refactor what is not broken.

Avoid broad cleanup inside feature work. If cleanup is useful, document it as a separate task.

## Rule 4 - Goal-Driven Execution

Define success criteria before editing. Loop until verified.

Strong success criteria should let an agent continue independently without inventing scope.

Every implementation task should include:

- Acceptance criteria.
- Verification command or manual check.
- Rollback or safety note when production/runtime data is involved.

## Rule 5 - Read Before You Write

Before adding code, read:

- Exports of the file being imported.
- Immediate callers of the function being changed.
- Shared utilities already available.
- Existing config shape and runtime data shape.

If unsure why existing code is structured a certain way, ask.

## Documentation Rules

- Keep active plans in `.gsd/`.
- Archive obsolete planning docs instead of deleting them.
- Update `.gsd/STATE.md` and `.gsd/state/IMPLEMENTATION_PLAN.md` after significant decisions.
- Do not let root Markdown become the source of truth except `README.md`, `HANDOFF.md`, and `AGENTS.md`.

## Git And Deploy Rules

- Do not deploy to VPS unless the user explicitly asks.
- Do not run production PM2 commands unless explicitly approved.
- Prefer testing environment first.
- Do not commit runtime data.
- Use atomic commits when the user asks for commits.

## Dashboard Maestro Guardrails

MVP scope:

- Monitor existing agents.
- Show critical states.
- Add audit events.
- Add backup-now in testing.
- Add PM2 control only through a safe server-side control layer.

Out of scope for MVP:

- SQLite migration.
- Restore from UI.
- Client-facing dashboard.
- Full responsive redesign.
- Replacing production dashboard.
