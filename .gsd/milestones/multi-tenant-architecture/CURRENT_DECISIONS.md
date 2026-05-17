# Current Decisions - Multi-Tenant Platform

> Captured from `/interrógame` on 2026-05-17.
> This document supersedes the archived 2026-05-10 planning docs.

## Vocabulary

- **Multi-tenant** means multi-client: one platform that can operate several clients safely.
- **Cliente** means the business account, for example `Dolce Party`.
- **Agente** or **local** means one WhatsApp number and one operating unit, for example `Santa Ana` or `Asturias`.

## Business Goal

Support 5-10 clients in the short term. Each client may have multiple agents. Billing is expected to be monthly, with implementation fee and pricing by agent.

The main driver is safer and faster onboarding of more clients while keeping the current production system stable.

## Production Safety

- `bot_dolce` on the VPS is real production and serves Santa Ana.
- `bot_testing` is the testing environment.
- The Windows repo has newer code than the VPS, but the VPS has the real production data for Santa Ana.
- Production is not migrated during the Dashboard Maestro MVP.
- Changes follow this path: local planning/code -> testing VPS -> production VPS.
- Deployment is manual by the owner for now. Automation comes later.

## Runtime Data Rules

These files and directories are treated as a single protected runtime package per agent:

- `historial.json`
- `pausas.json`
- `admin-numbers.json`
- `.wwebjs_auth/`
- logs
- stats
- agent config used by production

Do not move, overwrite, regenerate, or normalize them without an explicit backup and user confirmation.

## Dashboard Strategy

The Dashboard Maestro will be a new app under `multi-tenant/dashboard-maestro/`.

It will eventually replace the current `dashboard-central.js`, but it must prove itself in testing before replacement. It is internal only for the owner and partner. Clients do not access the Maestro.

## Access Model

Roles:

- **Superadmin**: owner/partner. Sees every client, every agent, every conversation, and every system action.
- **Cliente owner**: deferred. May be sold later as a separate dashboard or feature.
- **Empleado**: sees one assigned agent/local dashboard.

Initial client access remains per agent/local. A client owner dashboard that aggregates several locations is not part of the MVP.

## Data Strategy

Keep JSON storage for now. Do not migrate to SQLite during the Dashboard Maestro MVP.

Future recommendation:

- SQLite per agent/local for operational data.
- Shared monitoring store only for metrics, health, audit, and summaries.
- The Maestro may read full conversations on demand from each agent, but central storage should avoid duplicating full conversation history at first.

## Dashboard Maestro MVP Decisions

- Show whatever exists now: current clients and current agents.
- Desktop first. Responsive work is not a priority for MVP.
- Refresh every 5 minutes plus a manual "refresh now" action.
- Show a general system health semaphore.
- Track API calls and costs only for internal visibility, not billing.
- Use owner API keys for AI services at first. Per-client keys may be added later.
- Show bot vs human messages and handoffs.
- Handoff waiting longer than 10 minutes is critical.

## Control Decisions

The Maestro may control real PM2 processes in testing and later production.

Allowed actions for MVP:

- Start agent.
- Stop agent.
- Restart agent.
- Restart human dashboard.
- Pause bot globally.
- Resume bot globally.
- Show QR/session state.
- Create backup now.

Actions must write an audit event and show visible feedback. Critical actions should use a simple confirmation.

PM2 process names should be normalized during this stage.

## Alerts

Initial alert priority:

1. Dashboard-visible alerts.
2. Telegram.
3. Email.
4. WhatsApp later.

Alert by agent. Support maintenance mute per agent.

Critical alert types:

- Bot down.
- WhatsApp disconnected.
- Human dashboard down.
- Handoff waiting more than 10 minutes.
- Repeated AI error.
- API key failing.
- High disk or memory.
- Backup failure.

## Backups

- Backup before any deploy or risky change.
- Daily VPS backup.
- Retention default: 30 days.
- Include `.wwebjs_auth/`.
- Add "backup now" in Dashboard Maestro.
- Restore manually by SSH initially. No restore-from-UI in MVP.

## Onboarding

Future ideal: onboarding from Dashboard Maestro.

Practical path:

1. Script-guided onboarding first.
2. Later, Dashboard Maestro form uses the same underlying logic.

Minimum onboarding data:

- Client name.
- Agent/local name.
- WhatsApp phone.
- Address.
- Hours.
- Catalog.
- Dashboard users.
- Admin/ignored numbers.
- Prompt per agent.
- Ports.
- PM2 process names.
- Initial backup.

A client/agent is ready when config exists, ports are assigned, PM2 is created, dashboard is accessible, QR is scanned, a test message passes, and initial backup exists.

## Deferred

- SQLite migration.
- Client owner dashboard.
- Restore from UI.
- WhatsApp notifications for admin actions.
- Full responsive polish.
- Fully automated production deploy.
