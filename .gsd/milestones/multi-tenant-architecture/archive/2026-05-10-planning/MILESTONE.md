# Milestone: Multi-Tenant WhatsApp Bot Platform (FINAL)

**Status**: ✅ Approved - Ready for Implementation  
**Priority**: High  
**Target Date**: 4-6 weeks from start  
**Owner**: Development Team  
**Last Updated**: 2026-05-10

---

## 🎯 Objective

Transform the current dual-environment WhatsApp bot into a **scalable hybrid multi-tenant platform** that can serve multiple clients (5-10 initially, 50+ future) from a single server, with:

- **Complete data isolation** per client (SQLite per client)
- **3-level dashboard hierarchy** (Maestro → Cliente → Humano)
- **Semi-automated operations** (scripts for onboarding, updates, backups)
- **Config-based customization** (no code changes per client)
- **Centralized monitoring** with automatic notifications

---

## 🔍 Current State Analysis

### Current Architecture (Limitations)
```
bot_dolce/          → Production (Dolce Party hardcoded)
├── config/agents.json          → Hardcoded ports & paths
├── .env                        → Single environment config
├── .wwebjs_auth/              → Single WhatsApp session
├── data/                       → Mixed data
└── catalogs/                   → Single catalog

bot_testing/        → Testing (Manual copy of bot_dolce)
└── [Same structure, different ports]
```

**Problems:**
- ❌ Each new client requires full repository copy
- ❌ Configuration hardcoded in multiple files
- ❌ Port conflicts require manual management
- ❌ No centralized client management
- ❌ Difficult to maintain consistency across clients
- ❌ No easy way to add/remove clients
- ❌ Scaling requires manual server setup per client

---

## 🏗️ Target Architecture

### Multi-Tenant Platform Structure
```
whatsapp-bot-platform/                    → Single unified repository
│
├── core/                                 → Core bot engine (shared)
│   ├── lib/                             → Shared libraries
│   ├── orchestrator.js                  → Multi-client orchestrator
│   ├── dashboard-central.js             → Unified dashboard
│   └── agent-manager.js                 → Client-aware agent manager
│
├── config/                               → Configuration management
│   ├── clients/                         → Per-client configs
│   │   ├── dolce-party.json            → Client 1 config
│   │   ├── cliente-ejemplo.json        → Client 2 config
│   │   └── ...
│   ├── template.json                    → New client template
│   └── platform.json                    → Platform-wide settings
│
├── clients/                              → Client-specific data (isolated)
│   ├── dolce-party/
│   │   ├── .wwebjs_auth/               → WhatsApp session
│   │   ├── data/                        → Client data
│   │   ├── logs/                        → Client logs
│   │   ├── catalogs/                    → Client catalogs
│   │   └── .env                         → Client-specific env vars
│   ├── cliente-2/
│   │   └── [same structure]
│   └── ...
│
├── scripts/                              → Management scripts
│   ├── client-add.sh                    → Add new client
│   ├── client-remove.sh                 → Remove client
│   ├── client-update.sh                 → Update client config
│   ├── client-list.sh                   → List all clients
│   ├── port-manager.sh                  → Auto-assign ports
│   └── migrate-to-multitenant.sh        → Migration script
│
├── docs/                                 → Documentation
│   ├── ARCHITECTURE.md                  → System architecture
│   ├── CLIENT-ONBOARDING.md            → How to add clients
│   ├── DEPLOYMENT.md                    → Deployment guide
│   └── API.md                           → API documentation
│
├── .env.platform                         → Platform-level config
└── package.json                          → Unified dependencies
```

---

## 📋 Implementation Phases

### Phase 1: Core Refactoring (Foundation)
**Goal**: Prepare codebase for multi-tenancy without breaking current functionality

#### Tasks:
- [ ] **1.1** Create new repository structure
  - Create `core/`, `config/`, `clients/`, `scripts/` directories
  - Move shared code to `core/`
  
- [ ] **1.2** Refactor orchestrator for multi-client support
  - Make orchestrator client-aware
  - Load clients from `config/clients/` directory
  - Support dynamic client loading/unloading
  
- [ ] **1.3** Refactor agent-manager for isolation
  - Accept client ID as parameter
  - Use client-specific paths for data/logs/sessions
  - Ensure no cross-client data leakage
  
- [ ] **1.4** Create client configuration schema
  - Define JSON schema for client configs
  - Include: name, ports, paths, WhatsApp settings, catalog, admin numbers
  - Validate configs on load

**Deliverables:**
- ✅ Refactored codebase with multi-tenant structure
- ✅ Client configuration schema documented
- ✅ No breaking changes to current Dolce Party setup

---

### Phase 2: Port Management System
**Goal**: Automatic port assignment and conflict prevention

#### Tasks:
- [ ] **2.1** Create port registry system
  - Track assigned ports in `config/port-registry.json`
  - Auto-assign next available port
  - Prevent conflicts
  
- [ ] **2.2** Implement port allocation logic
  - Function to request N ports for a client
  - Reserve ports: API, Dashboard, WebSocket
  - Release ports when client removed
  
- [ ] **2.3** Update client configs to use port registry
  - Remove hardcoded ports from client configs
  - Reference port registry dynamically

**Deliverables:**
- ✅ Automated port management
- ✅ No manual port configuration needed
- ✅ Port conflict prevention

---

### Phase 3: Client Management Scripts
**Goal**: Simple CLI tools to manage clients

#### Tasks:
- [ ] **3.1** Create `client-add.sh` script
  - Interactive prompts for client details
  - Generate client config from template
  - Assign ports automatically
  - Create client directory structure
  - Initialize empty data/logs/catalogs
  
- [ ] **3.2** Create `client-remove.sh` script
  - Stop client processes
  - Archive client data (optional)
  - Remove client config
  - Release ports
  
- [ ] **3.3** Create `client-update.sh` script
  - Update client configuration
  - Restart client processes
  - Validate new config
  
- [ ] **3.4** Create `client-list.sh` script
  - List all clients with status
  - Show ports, uptime, message count
  - Color-coded status (online/offline/error)

**Deliverables:**
- ✅ Complete CLI toolset for client management
- ✅ Documentation for each script
- ✅ Error handling and validation

---

### Phase 4: Unified Dashboard
**Goal**: Single dashboard showing all clients

#### Tasks:
- [ ] **4.1** Refactor dashboard for multi-client view
  - Show all clients in grid/list view
  - Per-client metrics: messages, uptime, status
  - Filter/search clients
  
- [ ] **4.2** Add client drill-down view
  - Click client to see detailed stats
  - Show conversation history
  - Display QR code for re-authentication
  
- [ ] **4.3** Add client management UI
  - Start/stop clients from dashboard
  - View/edit client config
  - Real-time logs viewer

**Deliverables:**
- ✅ Unified dashboard for all clients
- ✅ Real-time monitoring
- ✅ Client management interface

---

### Phase 5: Migration & Testing
**Goal**: Migrate existing clients to new architecture

#### Tasks:
- [ ] **5.1** Create migration script
  - Detect current bot_dolce and bot_testing
  - Convert to new client structure
  - Preserve all data and sessions
  - Update PM2 configs
  
- [ ] **5.2** Test migration with Dolce Party
  - Run migration on test environment
  - Verify WhatsApp session preserved
  - Verify all data intact
  - Test bot functionality
  
- [ ] **5.3** Create rollback procedure
  - Document rollback steps
  - Create backup before migration
  - Test rollback process
  
- [ ] **5.4** Production migration
  - Schedule maintenance window
  - Execute migration
  - Monitor for issues
  - Verify all clients operational

**Deliverables:**
- ✅ Tested migration script
- ✅ Rollback procedure
- ✅ Successful production migration

---

### Phase 6: Documentation & Onboarding
**Goal**: Complete documentation for team and future clients

#### Tasks:
- [ ] **6.1** Write architecture documentation
  - System overview
  - Component descriptions
  - Data flow diagrams
  
- [ ] **6.2** Write client onboarding guide
  - Step-by-step process to add new client
  - Configuration options explained
  - Troubleshooting common issues
  
- [ ] **6.3** Write deployment guide
  - Server requirements
  - Installation steps
  - PM2 configuration
  - Firewall setup
  
- [ ] **6.4** Create video tutorials (optional)
  - Adding a new client
  - Managing clients via dashboard
  - Troubleshooting

**Deliverables:**
- ✅ Complete documentation suite
- ✅ Onboarding guide for new clients
- ✅ Deployment guide for new servers

---

## 🎁 Expected Benefits

### Scalability
- ✅ Add new client in **< 5 minutes** (vs hours currently)
- ✅ Support **100+ clients** on single server (resource-dependent)
- ✅ No code changes needed per client

### Maintainability
- ✅ Single codebase to maintain
- ✅ Bug fixes apply to all clients instantly
- ✅ Centralized monitoring and logging

### Operations
- ✅ Automated port management
- ✅ Unified dashboard for all clients
- ✅ Easy client onboarding/offboarding
- ✅ Consistent configuration across clients

### Business
- ✅ Faster client onboarding = more revenue
- ✅ Lower operational costs
- ✅ Professional multi-tenant platform
- ✅ Easy to demo to new clients

---

## 📊 Success Metrics

- [ ] Time to add new client: **< 5 minutes**
- [ ] Zero port conflicts
- [ ] All clients visible in single dashboard
- [ ] 100% data isolation between clients
- [ ] Zero downtime during client add/remove
- [ ] Migration completed with zero data loss

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | High | Low | Comprehensive backups, tested rollback |
| Port conflicts | Medium | Medium | Automated port registry |
| WhatsApp session corruption | High | Low | Session backup before changes |
| Performance degradation | Medium | Medium | Resource monitoring, load testing |
| Breaking existing clients | High | Low | Thorough testing, gradual rollout |

---

## 🔄 Migration Strategy

### Pre-Migration
1. Full backup of current system
2. Test migration in staging environment
3. Document current state
4. Prepare rollback plan

### Migration Steps
1. Stop all current bots
2. Run migration script
3. Verify data integrity
4. Start bots in new structure
5. Monitor for 24 hours
6. Remove old structure (after confirmation)

### Post-Migration
1. Update documentation
2. Train team on new structure
3. Monitor performance
4. Gather feedback

---

## 📝 Notes

- This milestone transforms the bot from single-tenant to multi-tenant
- Backward compatibility maintained during migration
- Existing Dolce Party client should work without changes
- New architecture enables rapid scaling to multiple clients
- Consider this the foundation for a SaaS platform

---

## 🔗 Related Documents

- [Current Implementation Plan](../state/IMPLEMENTATION_PLAN.md)
- [Architecture Decisions](../../docs/DECISIONS.md)
- [Deployment Guide](../../docs/DEPLOYMENT.md) (to be created)

---

**Next Steps:**
1. Review and approve this milestone
2. Estimate time for each phase
3. Assign tasks to team members
4. Begin Phase 1: Core Refactoring
