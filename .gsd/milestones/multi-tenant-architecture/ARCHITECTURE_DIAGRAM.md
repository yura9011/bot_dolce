# Multi-Tenant Architecture - Visual Overview

## Current vs Target Architecture

### 🔴 CURRENT ARCHITECTURE (Single-Tenant)

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS SERVER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │   bot_dolce (PRD)    │      │  bot_testing (DEV)   │   │
│  ├──────────────────────┤      ├──────────────────────┤   │
│  │ Port 3011 (API)      │      │ Port 4011 (API)      │   │
│  │ Port 3000 (Dashboard)│      │ Port 4000 (Dashboard)│   │
│  │                      │      │                      │   │
│  │ .env (hardcoded)     │      │ .env (hardcoded)     │   │
│  │ agents.json          │      │ agents.json          │   │
│  │ .wwebjs_auth/        │      │ .wwebjs_auth_testing/│   │
│  │ data/                │      │ data/                │   │
│  │ catalogs/            │      │ catalogs/            │   │
│  └──────────────────────┘      └──────────────────────┘   │
│                                                             │
│  ❌ Problems:                                               │
│  - Manual copy for each client                             │
│  - Port conflicts                                          │
│  - No centralized management                               │
│  - Difficult to scale                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### ✅ TARGET ARCHITECTURE (Multi-Tenant)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                            VPS SERVER                                     │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    CORE PLATFORM (Shared)                       │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  orchestrator.js  │  dashboard-central.js  │  agent-manager.js  │    │
│  │  (Multi-client aware)                                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                      │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   CONFIG MANAGEMENT                             │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  config/clients/                                                │    │
│  │    ├── dolce-party.json      (Client 1 config)                  │    │
│  │    ├── cliente-2.json        (Client 2 config)                  │    │
│  │    ├── cliente-3.json        (Client 3 config)                  │    │
│  │    └── ...                                                      │    │
│  │                                                                 │    │
│  │  config/port-registry.json   (Auto port assignment)            │    │
│  │  config/platform.json        (Platform settings)               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                      │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   CLIENT INSTANCES (Isolated)                   │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │    │
│  │  │ Dolce Party  │  │  Cliente 2   │  │  Cliente 3   │  ...    │    │
│  │  ├──────────────┤  ├──────────────┤  ├──────────────┤         │    │
│  │  │ Port: 5001   │  │ Port: 5011   │  │ Port: 5021   │         │    │
│  │  │ Dashboard:   │  │ Dashboard:   │  │ Dashboard:   │         │    │
│  │  │   5000       │  │   5010       │  │   5020       │         │    │
│  │  │              │  │              │  │              │         │    │
│  │  │ Data:        │  │ Data:        │  │ Data:        │         │    │
│  │  │ clients/     │  │ clients/     │  │ clients/     │         │    │
│  │  │ dolce-party/ │  │ cliente-2/   │  │ cliente-3/   │         │    │
│  │  │ ├─ .wwebjs   │  │ ├─ .wwebjs   │  │ ├─ .wwebjs   │         │    │
│  │  │ ├─ data/     │  │ ├─ data/     │  │ ├─ data/     │         │    │
│  │  │ ├─ logs/     │  │ ├─ logs/     │  │ ├─ logs/     │         │    │
│  │  │ └─ catalogs/ │  │ └─ catalogs/ │  │ └─ catalogs/ │         │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                      │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   UNIFIED DASHBOARD                             │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  Port 3000 (Platform Dashboard)                                 │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐   │    │
│  │  │  All Clients Overview                                   │   │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │    │
│  │  │  │ Client 1 │ │ Client 2 │ │ Client 3 │  ...          │   │    │
│  │  │  │ ✅ Online│ │ ✅ Online│ │ ⚠️ Warn  │               │   │    │
│  │  │  │ 234 msgs │ │ 156 msgs │ │ 89 msgs  │               │   │    │
│  │  │  └──────────┘ └──────────┘ └──────────┘               │   │    │
│  │  └─────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ✅ Benefits:                                                             │
│  - Single codebase for all clients                                       │
│  - Add client in < 5 minutes                                             │
│  - Automated port management                                             │
│  - Centralized monitoring                                                │
│  - Easy to scale to 100+ clients                                         │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Adding a New Client

```
┌──────────────────────────────────────────────────────────────────┐
│                    ADD NEW CLIENT FLOW                           │
└──────────────────────────────────────────────────────────────────┘

1. Admin runs: ./scripts/client-add.sh
   │
   ├─> Prompts for client details
   │   (name, phone, address, admin number)
   │
   ├─> Generates client ID (e.g., "cliente-nuevo")
   │
   ├─> Creates directory structure:
   │   clients/cliente-nuevo/
   │   ├── .wwebjs_auth/
   │   ├── data/
   │   ├── logs/
   │   └── catalogs/
   │
   ├─> Assigns ports automatically:
   │   - Checks port-registry.json
   │   - Finds next available ports
   │   - Reserves: API port, Dashboard port
   │
   ├─> Creates client config:
   │   config/clients/cliente-nuevo.json
   │   {
   │     "id": "cliente-nuevo",
   │     "ports": { "api": 5031, "dashboard": 5030 },
   │     "paths": { ... },
   │     "business": { ... }
   │   }
   │
   ├─> Opens firewall ports:
   │   sudo ufw allow 5031/tcp
   │   sudo ufw allow 5030/tcp
   │
   ├─> Starts client processes:
   │   pm2 start orchestrator.js --name "bot-cliente-nuevo" -- start cliente-nuevo
   │   pm2 start dashboard.js --name "dashboard-cliente-nuevo" -- cliente-nuevo
   │
   └─> Shows QR code for WhatsApp authentication
       pm2 logs bot-cliente-nuevo --lines 50

✅ Client ready in < 5 minutes!
```

---

## Client Isolation Model

```
┌────────────────────────────────────────────────────────────────┐
│                    CLIENT ISOLATION                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Each client has COMPLETELY ISOLATED:                          │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  1. WhatsApp Session                                 │     │
│  │     clients/{client-id}/.wwebjs_auth/                │     │
│  │     - Separate authentication                        │     │
│  │     - Different phone number                         │     │
│  │     - Independent connection                         │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  2. Data Storage                                     │     │
│  │     clients/{client-id}/data/                        │     │
│  │     - Conversation history                           │     │
│  │     - User preferences                               │     │
│  │     - Statistics                                     │     │
│  │     - Paused users                                   │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  3. Logs                                             │     │
│  │     clients/{client-id}/logs/                        │     │
│  │     - Separate log files                             │     │
│  │     - Independent debugging                          │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  4. Product Catalog                                  │     │
│  │     clients/{client-id}/catalogs/                    │     │
│  │     - Custom products                                │     │
│  │     - Different categories                           │     │
│  │     - Client-specific pricing                        │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  5. Configuration                                    │     │
│  │     config/clients/{client-id}.json                  │     │
│  │     - Business info                                  │     │
│  │     - Admin numbers                                  │     │
│  │     - AI settings                                    │     │
│  │     - Feature flags                                  │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  6. Network Ports                                    │     │
│  │     - Unique API port                                │     │
│  │     - Unique Dashboard port                          │     │
│  │     - No conflicts                                   │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ✅ ZERO data leakage between clients                          │
│  ✅ Complete independence                                      │
│  ✅ Can remove client without affecting others                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Port Management System

```
┌────────────────────────────────────────────────────────────────┐
│                    PORT REGISTRY                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  config/port-registry.json:                                    │
│  {                                                             │
│    "platform": {                                               │
│      "dashboard": 3000                                         │
│    },                                                          │
│    "clients": {                                                │
│      "dolce-party": {                                          │
│        "api": 5001,                                            │
│        "dashboard": 5000                                       │
│      },                                                        │
│      "cliente-2": {                                            │
│        "api": 5011,                                            │
│        "dashboard": 5010                                       │
│      },                                                        │
│      "cliente-3": {                                            │
│        "api": 5021,                                            │
│        "dashboard": 5020                                       │
│      }                                                         │
│    },                                                          │
│    "nextAvailable": 5031                                       │
│  }                                                             │
│                                                                │
│  Port Allocation Strategy:                                     │
│  - Platform: 3000-3999                                         │
│  - Clients: 5000+ (increments of 10)                           │
│  - Each client gets 10 ports reserved                          │
│  - Auto-increment on new client                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Migration Path

```
CURRENT STATE                    MIGRATION                    TARGET STATE
┌──────────────┐                                           ┌──────────────┐
│  bot_dolce   │                                           │   Platform   │
│  (PRD)       │                                           │              │
│              │                                           │  ┌────────┐  │
│ Port 3011    │  ──────────────────────────────────────> │  │Client 1│  │
│ Port 3000    │  1. Backup data                          │  │Dolce   │  │
│              │  2. Run migration script                 │  │Party   │  │
│ .env         │  3. Convert to client config             │  └────────┘  │
│ agents.json  │  4. Move to clients/dolce-party/         │              │
│ data/        │  5. Update PM2 configs                   │  ┌────────┐  │
│ .wwebjs_auth/│  6. Restart with new structure           │  │Client 2│  │
└──────────────┘                                           │  │...     │  │
                                                           │  └────────┘  │
┌──────────────┐                                           │              │
│ bot_testing  │                                           │  ┌────────┐  │
│  (DEV)       │  ──────────────────────────────────────> │  │Client N│  │
│              │  Same migration process                  │  │...     │  │
│ Port 4011    │                                           │  └────────┘  │
│ Port 4000    │                                           │              │
└──────────────┘                                           └──────────────┘

Timeline: ~2 hours with testing
Downtime: ~15 minutes per client
Risk: Low (with proper backups)
```

---

## Scaling Capacity

```
┌────────────────────────────────────────────────────────────────┐
│                    SCALING ESTIMATES                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Server Resources (Current VPS):                               │
│  - CPU: 2 cores                                                │
│  - RAM: 4GB                                                    │
│  - Disk: 100GB                                                 │
│                                                                │
│  Per Client Resource Usage:                                    │
│  - RAM: ~100-150MB per bot                                     │
│  - CPU: ~5-10% under normal load                               │
│  - Disk: ~500MB (sessions + data)                              │
│                                                                │
│  Estimated Capacity:                                           │
│  - Conservative: 15-20 clients                                 │
│  - Optimal: 10-15 clients (with headroom)                      │
│  - Maximum: 25-30 clients (tight)                              │
│                                                                │
│  Scaling Options:                                              │
│  1. Vertical: Upgrade VPS (8GB RAM = 40+ clients)              │
│  2. Horizontal: Multiple VPS with load balancer                │
│  3. Hybrid: Group clients by activity level                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

This architecture provides a solid foundation for scaling to multiple clients while maintaining isolation, security, and ease of management.
