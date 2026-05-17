# Multi-Tenant Architecture

> Current GSD source of truth for the multi-client platform.
> Last updated: 2026-05-17

## Status

The current multi-agent production system stays stable. Multi-tenant work starts as a new app under `multi-tenant/dashboard-maestro/` and is tested in the VPS testing environment before any production replacement.

## Current Documents

Read these first, in order:

1. [CURRENT_DECISIONS.md](./CURRENT_DECISIONS.md) - decisions from the 2026-05-17 interrogation.
2. [DASHBOARD_MAESTRO_MVP.md](./DASHBOARD_MAESTRO_MVP.md) - MVP scope and acceptance criteria.
3. [PHASE_2_PLAN.md](./PHASE_2_PLAN.md) - implementation plan for Dashboard Maestro.

## Historical Documents

Older planning documents from 2026-05-10 were archived under:

- [archive/2026-05-10-planning/](./archive/2026-05-10-planning/)

Use them only for background. If they conflict with the current documents, the current documents win.

## Architecture Direction

```text
Cliente -> Agente/Local -> WhatsApp session + data + dashboard humano
```

- The Dashboard Maestro is internal only: owner/admin view for all clients and agents.
- Existing production (`bot_dolce`) remains stable until the new flow is proven.
- Existing testing (`bot_testing`) is the proving ground.
- Runtime data is sacred: do not touch histories, pauses, admin numbers, WhatsApp sessions, stats, logs, or production config without an explicit backup and instruction.

## Next Action

Implement Dashboard Maestro MVP as a new app in `multi-tenant/dashboard-maestro/`.
