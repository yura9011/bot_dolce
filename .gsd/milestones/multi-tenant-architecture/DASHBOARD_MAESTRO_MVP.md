# Dashboard Maestro MVP

> Internal dashboard for operating all clients and agents.
> Build as a new app in `multi-tenant/dashboard-maestro/`.

## Objective

Create an internal operations dashboard that monitors and controls agents without changing current production behavior.

## Non-Negotiables

- Do not touch `bot_dolce` runtime data.
- Test against the VPS testing environment before production use.
- Treat production as stable until the user explicitly approves replacement.
- Keep changes surgical and scoped to Dashboard Maestro and required read-only/health endpoints.

## Main Screen

The first screen shows:

- Global system health semaphore.
- Agent status cards/table.
- Critical alerts.
- Handoffs waiting more than 10 minutes.
- Last refresh timestamp.
- Manual refresh action.

## Agent Status Fields

Show per agent:

- Client name.
- Agent/local name.
- Bot process status.
- WhatsApp connected/disconnected state.
- Human dashboard status.
- API port and dashboard port.
- Last message timestamp.
- Pending handoffs count.
- Recent errors count.
- Message counts.
- AI calls and estimated cost.
- Last backup status.
- Maintenance mute state.

## Critical States

Mark as critical:

- Bot down.
- WhatsApp disconnected.
- Dashboard down.
- Handoff waiting more than 10 minutes.
- Repeated AI errors.
- API key failures.
- High memory or disk usage.
- Backup failure.

## Controls

Controls available to superadmin:

- Start agent.
- Stop agent.
- Restart agent.
- Restart dashboard humano.
- Pause bot global.
- Resume bot global.
- View QR/session state.
- Create backup now.
- Mute/unmute alerts for maintenance.

Each control must:

- Show a confirmation for risky actions.
- Execute against normalized PM2 process names.
- Show visible result feedback.
- Write an audit event.

## Audit Log

Record:

- Timestamp.
- User.
- IP if available.
- Action.
- Target client/agent.
- Result.
- Error message if failed.

## Metrics

Track for internal visibility:

- Messages received.
- Messages sent.
- Bot-handled messages.
- Human-handled messages.
- Handoffs.
- AI calls.
- AI errors.
- Fallback provider used.
- Estimated tokens if available.
- Estimated cost if available.

## Alerts

MVP supports dashboard-visible alerts. Telegram is the first external notification target.

Alert records should include:

- Agent.
- Severity.
- Type.
- Message.
- First seen.
- Last seen.
- Resolved timestamp.
- Muted/unmuted state.

## Refresh

- Poll every 5 minutes by default.
- Provide "refresh now".
- Avoid high-frequency polling unless the user asks for live mode later.

## Success Criteria

- Dashboard Maestro runs as a separate app.
- It can monitor testing agents without touching production data.
- It shows agent health and critical states.
- It can execute at least one safe control action in testing with audit.
- Backup-now works in testing.
- Handoffs over 10 minutes are visible as critical.
- The current production dashboard remains unaffected.
