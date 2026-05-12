# Milestone: Hybrid Multi-Tenant WhatsApp Bot Platform

**Status**: ✅ Approved - Ready for Implementation  
**Priority**: High  
**Estimated Duration**: 4-6 weeks  
**Owner**: Development Team  
**Date**: 2026-05-10

---

## 🎯 Executive Summary

Transform the current dual-environment setup into a **hybrid multi-tenant platform** that enables:

- **Rapid client onboarding**: 10-15 minutes (vs 2-4 hours currently)
- **Complete data isolation**: SQLite database per client
- **3-tier dashboard system**: Admin → Client → Human operator
- **Semi-automated operations**: Scripts for common tasks
- **Scalability**: Support 5-10 clients initially, 50+ future

**Business Impact:**
- 90% faster client onboarding
- Single codebase maintenance
- Professional monitoring dashboard
- Foundation for subscription-based revenue

---

## 📊 Current State vs Target State

### Current (As of 2026-05-10)
```
/home/forma/
├── bot_dolce/          → Production (Dolce Party)
│   ├── Port 3011 (API)
│   ├── Port 3000 (Dashboard)
│   └── Hardcoded config
│
└── bot_testing/        → Testing environment
    ├── Port 4011 (API)
    ├── Port 4000 (Dashboard)
    └── Hardcoded config

Problems:
❌ Manual copy for each client
❌ Hardcoded configurations
❌ No centralized monitoring
❌ Difficult to scale
```

### Target (After Implementation)
```
/home/forma/
├── dashboard-maestro/              → Port 3000 (YOUR control)
│   ├── Monitors ALL clients
│   ├── Aggregated metrics
│   └── Centralized logs
│
└── clients/
    ├── dolce-party/
    │   ├── dashboard-cliente.js    → Port 5000
    │   ├── santa-ana/              → Port 5001
    │   │   ├── bot/
    │   │   ├── data/database.sqlite  ← Isolated
    │   │   └── .wwebjs_auth/         ← Isolated
    │   └── centro/                 → Port 5002
    │
    └── cliente-2/
        └── local-1/                → Port 5011

Benefits:
✅ Add client in 10-15 minutes
✅ Complete data isolation
✅ Centralized monitoring
✅ Easy to scale
```

---

## 🏗️ Architecture Overview

### Key Architectural Decisions

Based on [DECISIONS_MADE.md](./DECISIONS_MADE.md):

1. **Data Isolation**: Hybrid (SQLite per client + shared monitoring DB)
2. **Updates**: Semi-automated scripts
3. **Monitoring**: Dashboard + automatic notifications
4. **Backups**: Automated (frequency TBD)
5. **Onboarding**: Semi-automated script
6. **Customization**: Config-based (JSON files)
7. **Pricing**: Monthly subscription
8. **Compliance**: Argentina data protection laws

### 3-Tier Dashboard System

```
┌─────────────────────────────────────────────────────────┐
│  TIER 1: Dashboard Maestro (Port 3000)                  │
│  Users: YOU (admin/operator)                            │
│  ─────────────────────────────────────────────────────  │
│  • View ALL clients                                     │
│  • View ALL bots                                        │
│  • Aggregated metrics                                   │
│  • Start/Stop any bot                                   │
│  • Centralized logs                                     │
│  • Alerts & notifications                               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  TIER 2: Dashboard Cliente (Ports 5000, 5010, 5020...) │
│  Users: Client owner (e.g., Dolce Party owner)         │
│  ─────────────────────────────────────────────────────  │
│  • View ONLY their locations                            │
│  • Statistics of their bots                             │
│  • Access to human dashboards of their locations        │
│  • CANNOT see other clients                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  TIER 3: Dashboard Humano (Ports 5001, 5002, 5011...)  │
│  Users: Client employees (e.g., Santa Ana salesperson) │
│  ─────────────────────────────────────────────────────  │
│  • View conversations in real-time                      │
│  • Take control of conversation                         │
│  • Respond as human                                     │
│  • View history                                         │
│  • Location statistics                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Phases

### Phase 1: Foundation & Core Refactoring (Week 1-2)

**Goal**: Create base structure without breaking current functionality

#### Tasks:
- [ ] **1.1** Create new directory structure
  ```
  /home/forma/
  ├── dashboard-maestro/
  ├── clients/
  ├── scripts/
  └── templates/
  ```

- [ ] **1.2** Extract template from current bot_dolce
  - Identify shared code
  - Create template repository structure
  - Document configuration points

- [ ] **1.3** Create client configuration schema
  ```json
  {
    "client_id": "string",
    "name": "string",
    "enabled": boolean,
    "ports": { "dashboard": number, "bots": [numbers] },
    "paths": { "data": "string", "logs": "string" },
    "business": { "name": "string", "phone": "string", ... },
    "features": { "voice": boolean, "payments": boolean, ... }
  }
  ```

- [ ] **1.4** Implement port management system
  - Port registry (JSON file)
  - Auto-assign next available port
  - Prevent conflicts

**Deliverables:**
- ✅ Directory structure created
- ✅ Template extracted
- ✅ Configuration schema defined
- ✅ Port management working

**Success Criteria:**
- Template can be cloned
- Configuration validates correctly
- Ports assigned without conflicts

---

### Phase 2: Dashboard Maestro (Week 2-3)

**Goal**: Build centralized monitoring dashboard

#### Tasks:
- [ ] **2.1** Create dashboard maestro backend
  - Express.js server (port 3000)
  - WebSocket for real-time updates
  - API endpoints for client management

- [ ] **2.2** Implement monitoring system
  - Health check endpoints per bot
  - Metrics collection (CPU, RAM, messages, errors)
  - Log aggregation

- [ ] **2.3** Build dashboard maestro UI
  - Client list with status indicators
  - Real-time metrics display
  - Log viewer
  - Start/Stop controls

- [ ] **2.4** Implement notification system
  - Email notifications
  - Alert rules (bot down, high error rate, etc.)
  - Notification history

**Deliverables:**
- ✅ Dashboard maestro running on port 3000
- ✅ Real-time monitoring of all clients
- ✅ Automatic notifications working

**Success Criteria:**
- Can see all clients in one view
- Receives alert when bot goes down
- Can start/stop bots from dashboard

---

### Phase 3: Automation Scripts (Week 3-4)

**Goal**: Automate common operations

#### Tasks:
- [ ] **3.1** Create `add-client.sh` script
  - Interactive prompts for client details
  - Clone template
  - Generate configuration
  - Assign ports
  - Create directory structure
  - Configure PM2
  - Open firewall ports
  - Output: Ready to scan QR

- [ ] **3.2** Create `update-client.sh` script
  - Backup current version
  - Pull new code
  - Run tests
  - Restart bot
  - Verify health
  - Rollback if fails

- [ ] **3.3** Create `backup-client.sh` script
  - Backup database
  - Backup WhatsApp session
  - Backup configuration
  - Compress and store
  - Verify backup integrity

- [ ] **3.4** Create `health-check.sh` script
  - Check all bots
  - Verify WhatsApp connections
  - Check disk space
  - Check memory usage
  - Report status

**Deliverables:**
- ✅ `scripts/add-client.sh` (10-15 min to add client)
- ✅ `scripts/update-client.sh` (automated updates)
- ✅ `scripts/backup-client.sh` (automated backups)
- ✅ `scripts/health-check.sh` (system health)

**Success Criteria:**
- Can add new client in < 15 minutes
- Updates work without manual intervention
- Backups run automatically
- Health checks detect issues

---

### Phase 4: Client & Human Dashboards (Week 4-5)

**Goal**: Implement tier 2 and tier 3 dashboards

#### Tasks:
- [ ] **4.1** Refactor existing dashboard for multi-local support
  - Dashboard shows multiple locations per client
  - Aggregated statistics
  - Links to human dashboards

- [ ] **4.2** Implement access control
  - Client can only see their data
  - Employees can only see their location
  - Admin can see everything

- [ ] **4.3** Enhance human dashboard
  - Real-time conversation view
  - Take control functionality
  - Human response interface
  - Conversation history

**Deliverables:**
- ✅ Dashboard cliente working (tier 2)
- ✅ Dashboard humano enhanced (tier 3)
- ✅ Access control implemented

**Success Criteria:**
- Client sees only their locations
- Employee sees only their location
- Human takeover works smoothly

---

### Phase 5: Migration & Testing (Week 5-6)

**Goal**: Migrate existing clients to new structure

#### Tasks:
- [ ] **5.1** Create migration script
  - Detect current bot_dolce and bot_testing
  - Convert to new client structure
  - Preserve all data and sessions
  - Update PM2 configs

- [ ] **5.2** Test migration in staging
  - Clone production to test environment
  - Run migration script
  - Verify all functionality
  - Test rollback procedure

- [ ] **5.3** Migrate Dolce Party (production)
  - Schedule maintenance window
  - Backup everything
  - Run migration
  - Verify WhatsApp sessions
  - Test all functionality
  - Monitor for 24 hours

- [ ] **5.4** Migrate testing environment
  - Same process as production
  - Verify isolation from production

**Deliverables:**
- ✅ Migration script tested
- ✅ Dolce Party migrated successfully
- ✅ Testing environment migrated
- ✅ Zero data loss

**Success Criteria:**
- All WhatsApp sessions preserved
- All conversation history intact
- All bots functioning normally
- Dashboards accessible

---

### Phase 6: Documentation & Polish (Week 6)

**Goal**: Complete documentation and final touches

#### Tasks:
- [ ] **6.1** Write operator documentation
  - How to add a client
  - How to update clients
  - How to troubleshoot issues
  - How to read logs

- [ ] **6.2** Write client documentation
  - How to access dashboard
  - How to use human takeover
  - How to read statistics
  - FAQ

- [ ] **6.3** Create runbooks
  - What to do if bot goes down
  - What to do if server is full
  - What to do if WhatsApp disconnects
  - Backup and restore procedures

- [ ] **6.4** Final testing and optimization
  - Load testing
  - Security audit
  - Performance optimization
  - Bug fixes

**Deliverables:**
- ✅ Complete documentation
- ✅ Runbooks for common scenarios
- ✅ System tested and optimized

**Success Criteria:**
- Documentation is clear and complete
- Can onboard new operator with docs
- All known issues resolved

---

## 📊 Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Client onboarding time | 2-4 hours | < 15 min | Phase 3 |
| Clients per server | 2 | 10-15 | Phase 5 |
| Update deployment time | 30 min | 5 min | Phase 3 |
| Time to detect bot failure | Manual check | < 5 min | Phase 2 |
| Backup frequency | Manual | Automated | Phase 3 |

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | High | Low | Full backups + tested rollback |
| WhatsApp session corruption | High | Low | Session backup before changes |
| Port conflicts | Medium | Low | Automated port registry |
| Performance degradation | Medium | Medium | Resource monitoring + load testing |
| Breaking existing functionality | High | Low | Thorough testing + gradual rollout |

---

## 💰 Resource Requirements

### Development Time
- **Phase 1**: 40 hours (1 week full-time, 2 weeks part-time)
- **Phase 2**: 40 hours
- **Phase 3**: 40 hours
- **Phase 4**: 40 hours
- **Phase 5**: 20 hours
- **Phase 6**: 20 hours
- **Total**: 200 hours (~5 weeks full-time, 10 weeks part-time)

### Infrastructure
- **Current**: 1 VPS (4GB RAM, 2 CPU)
- **Sufficient for**: 10-15 clients
- **Upgrade needed when**: > 15 clients or CPU > 70%

---

## 🎯 Definition of Done

The milestone is complete when:

- [ ] Can add new client in < 15 minutes using script
- [ ] Dashboard maestro shows all clients in real-time
- [ ] Automatic notifications work (email)
- [ ] Backups run automatically
- [ ] Dolce Party migrated successfully
- [ ] All 3 dashboard tiers working
- [ ] Complete documentation available
- [ ] Zero data loss verified
- [ ] All tests passing

---

## 📅 Timeline

**Start Date**: TBD (after approval)  
**End Date**: 4-6 weeks from start  
**Milestones:**
- Week 2: Foundation complete
- Week 3: Dashboard maestro live
- Week 4: Scripts working
- Week 5: Dashboards complete
- Week 6: Migration done
- Week 6: Documentation complete

---

## 🔗 Related Documents

- [Decisions Made](./DECISIONS_MADE.md) - Architectural decisions
- [Industry Best Practices](./INDUSTRY_BEST_PRACTICES.md) - Research and patterns
- [Critical Decisions](./CRITICAL_DECISIONS.md) - Decision framework
- [Implementation Plan](./IMPLEMENTATION_PLAN_DETAILED.md) - Detailed tasks (to be created)
- [Scripts Design](./SCRIPTS_DESIGN.md) - Script specifications (to be created)

---

**Status**: ✅ Ready for implementation  
**Next Action**: Create detailed implementation plan and script designs  
**Approval**: Pending final review
