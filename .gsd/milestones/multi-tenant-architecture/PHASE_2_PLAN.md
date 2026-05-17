# Phase 2 Plan - Dashboard Maestro

> Current implementation plan for the next multi-tenant phase.

## Phase Goal

Build the Dashboard Maestro as a separate internal app that monitors and controls existing agents through the testing environment first.

## Task 1 - App Skeleton

Create `multi-tenant/dashboard-maestro/` as an independent Express + Socket.IO app.

Acceptance:

- App starts on configurable port.
- Serves static UI.
- Has authenticated internal access.
- Does not replace `dashboard-central.js`.

## Task 2 - Agent Registry Adapter

Read current agent definitions from config without mutating them.

Acceptance:

- Lists current agents.
- Handles enabled/disabled agents.
- Displays API and dashboard ports.
- Can later support `/clients/...` structure.

## Task 3 - Health Collection

Collect status from existing agent APIs and dashboard ports.

Acceptance:

- Detects bot API up/down.
- Detects dashboard humano up/down.
- Shows last successful check.
- Shows errors without crashing the Maestro.

## Task 4 - PM2 Control Layer

Create a small control layer around normalized PM2 process names.

Acceptance:

- Supports start/stop/restart in testing.
- Records audit event.
- Shows result feedback.
- Does not expose shell command construction to UI input.

## Task 5 - Backup Now

Wire a safe backup action for testing.

Acceptance:

- Creates a timestamped backup.
- Includes runtime data and `.wwebjs_auth/`.
- Records success/failure.
- Does not implement restore from UI.

## Task 6 - Alerts

Implement dashboard-visible alerts.

Acceptance:

- Bot down alert.
- Dashboard down alert.
- WhatsApp disconnected alert if status is available.
- Handoff older than 10 minutes alert.
- Maintenance mute per agent.

## Task 7 - Metrics And Cost Visibility

Show usage summaries.

Acceptance:

- Messages received/sent.
- Bot vs human messages.
- Handoffs.
- AI calls if currently tracked, otherwise placeholder and instrumentation plan.
- Estimated cost only when pricing inputs are configured.

## Task 8 - Testing Checklist

Validate in testing before production.

Acceptance:

- Maestro sees testing agents.
- PM2 actions work in testing.
- Backup now works.
- Alerts render.
- Audit log records actions.
- No production runtime data touched.

## Out Of Scope

- SQLite migration.
- Client-facing dashboard.
- Full onboarding form.
- Restore from UI.
- Production replacement.
- Mobile-first responsive polish.
