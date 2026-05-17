# Implementation Plan - Detailed Task Breakdown

**Project**: Hybrid Multi-Tenant WhatsApp Bot Platform  
**Duration**: 4-6 weeks  
**Last Updated**: 2026-05-10

---

## 📋 Task Management

### Legend
- 🔴 **Blocker**: Must be done before other tasks
- 🟡 **Important**: High priority
- 🟢 **Nice to have**: Can be deferred
- ⏱️ **Estimated time**
- 🔗 **Dependencies**

---

## Phase 1: Foundation & Core Refactoring (Week 1-2)

### 1.1 Create Directory Structure
**Priority**: 🔴 Blocker  
**Time**: 2 hours  
**Dependencies**: None

**Tasks:**
```bash
# Create base structure
mkdir -p /home/forma/dashboard-maestro
mkdir -p /home/forma/clients
mkdir -p /home/forma/scripts
mkdir -p /home/forma/templates

# Create template structure
mkdir -p /home/forma/templates/bot-template/{bot,data,logs,catalogs,.wwebjs_auth}
```

**Acceptance Criteria:**
- [ ] All directories created
- [ ] Correct permissions set
- [ ] Structure documented

---

### 1.2 Extract Template from bot_dolce
**Priority**: 🔴 Blocker  
**Time**: 8 hours  
**Dependencies**: 1.1

**Sub-tasks:**
1. **Identify shared code** (2h)
   - [ ] List all files in bot_dolce
   - [ ] Mark files that are client-specific
   - [ ] Mark files that are shared/template

2. **Create template structure** (3h)
   - [ ] Copy shared files to template
   - [ ] Replace hardcoded values with placeholders
   - [ ] Create config.template.json

3. **Test template** (2h)
   - [ ] Clone template to test location
   - [ ] Replace placeholders
   - [ ] Verify bot starts

4. **Document template** (1h)
   - [ ] List all placeholder variables
   - [ ] Document configuration options
   - [ ] Create README for template

**Acceptance Criteria:**
- [ ] Template can be cloned
- [ ] All placeholders documented
- [ ] Test bot starts successfully

---

### 1.3 Create Client Configuration Schema
**Priority**: 🔴 Blocker  
**Time**: 4 hours  
**Dependencies**: 1.2

**Tasks:**
1. **Define JSON schema** (2h)
   ```json
   {
     "$schema": "http://json-schema.org/draft-07/schema#",
     "type": "object",
     "required": ["client_id", "name", "business"],
     "properties": {
       "client_id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
       "name": { "type": "string" },
       "enabled": { "type": "boolean", "default": true },
       "ports": {
         "type": "object",
         "properties": {
           "dashboard": { "type": "number" },
           "bots": { "type": "array", "items": { "type": "number" } }
         }
       },
       "business": {
         "type": "object",
         "required": ["name", "phone"],
         "properties": {
           "name": { "type": "string" },
           "phone": { "type": "string" },
           "address": { "type": "string" },
           "hours": { "type": "string" }
         }
       },
       "features": {
         "type": "object",
         "properties": {
           "voice_messages": { "type": "boolean", "default": false },
           "payments": { "type": "boolean", "default": false }
         }
       }
     }
   }
   ```

2. **Create validation function** (1h)
   - [ ] Implement JSON schema validator
   - [ ] Test with valid configs
   - [ ] Test with invalid configs

3. **Create example configs** (1h)
   - [ ] config.example.json (template)
   - [ ] dolce-party.json (real example)
   - [ ] Document all fields

**Acceptance Criteria:**
- [ ] Schema validates correctly
- [ ] Example configs provided
- [ ] All fields documented

---

### 1.4 Implement Port Management System
**Priority**: 🔴 Blocker  
**Time**: 6 hours  
**Dependencies**: None

**Tasks:**
1. **Create port registry** (2h)
   ```json
   {
     "platform": {
       "dashboard_maestro": 3000
     },
     "clients": {
       "dolce-party": {
         "dashboard": 5000,
         "bots": [5001, 5002]
       }
     },
     "next_available": 5010,
     "reserved": [3000, 5000, 5001, 5002]
   }
   ```

2. **Implement port allocation** (3h)
   ```javascript
   // port-manager.js
   function assignPorts(clientId, numBots) {
     // Read registry
     // Find next available block
     // Reserve ports
     // Update registry
     // Return assigned ports
   }
   
   function releasePorts(clientId) {
     // Remove from registry
     // Free ports
   }
   ```

3. **Test port management** (1h)
   - [ ] Test assign ports
   - [ ] Test release ports
   - [ ] Test conflict detection

**Acceptance Criteria:**
- [ ] Ports assigned automatically
- [ ] No conflicts possible
- [ ] Registry persists correctly

---

## Phase 2: Dashboard Maestro (Week 2-3)

### 2.1 Create Dashboard Maestro Backend
**Priority**: 🟡 Important  
**Time**: 12 hours  
**Dependencies**: 1.1, 1.3

**Tasks:**
1. **Setup Express server** (2h)
   ```javascript
   // dashboard-maestro/server.js
   const express = require('express');
   const app = express();
   
   app.get('/api/clients', getClients);
   app.get('/api/clients/:id/status', getClientStatus);
   app.post('/api/clients/:id/start', startClient);
   app.post('/api/clients/:id/stop', stopClient);
   
   app.listen(3000);
   ```

2. **Implement WebSocket** (3h)
   - [ ] Setup Socket.IO
   - [ ] Broadcast client status updates
   - [ ] Handle client connections

3. **Create API endpoints** (4h)
   - [ ] GET /api/clients (list all)
   - [ ] GET /api/clients/:id (get one)
   - [ ] GET /api/clients/:id/status (health)
   - [ ] GET /api/clients/:id/metrics (stats)
   - [ ] POST /api/clients/:id/start
   - [ ] POST /api/clients/:id/stop
   - [ ] POST /api/clients/:id/restart
   - [ ] GET /api/clients/:id/logs

4. **Test API** (3h)
   - [ ] Test all endpoints
   - [ ] Test WebSocket updates
   - [ ] Test error handling

**Acceptance Criteria:**
- [ ] Server runs on port 3000
- [ ] All API endpoints work
- [ ] WebSocket updates in real-time

---

### 2.2 Implement Monitoring System
**Priority**: 🟡 Important  
**Time**: 10 hours  
**Dependencies**: 2.1

**Tasks:**
1. **Create health check endpoints** (3h)
   ```javascript
   // In each bot
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       whatsapp_connected: client.info ? true : false,
       last_message: lastMessageTime,
       queue_size: messageQueue.length,
       memory_mb: process.memoryUsage().heapUsed / 1024 / 1024,
       uptime_seconds: process.uptime()
     });
   });
   ```

2. **Implement metrics collection** (4h)
   - [ ] CPU usage per bot
   - [ ] Memory usage per bot
   - [ ] Message count per bot
   - [ ] Error rate per bot
   - [ ] Response time per bot

3. **Create monitoring database** (2h)
   ```sql
   CREATE TABLE metrics (
     id INTEGER PRIMARY KEY,
     client_id TEXT,
     bot_id TEXT,
     timestamp INTEGER,
     cpu_percent REAL,
     memory_mb REAL,
     messages_count INTEGER,
     error_count INTEGER,
     response_time_ms REAL
   );
   ```

4. **Implement log aggregation** (1h)
   - [ ] Collect logs from all bots
   - [ ] Store in centralized location
   - [ ] Implement log rotation

**Acceptance Criteria:**
- [ ] Health checks return correct data
- [ ] Metrics collected every minute
- [ ] Logs aggregated centrally

---

### 2.3 Build Dashboard Maestro UI
**Priority**: 🟡 Important  
**Time**: 16 hours  
**Dependencies**: 2.1, 2.2

**Tasks:**
1. **Create HTML/CSS structure** (4h)
   - [ ] Header with title
   - [ ] Client list grid
   - [ ] Metrics charts
   - [ ] Log viewer
   - [ ] Control buttons

2. **Implement client list view** (4h)
   - [ ] Display all clients
   - [ ] Status indicators (online/offline/warning)
   - [ ] Key metrics per client
   - [ ] Click to expand details

3. **Implement real-time updates** (4h)
   - [ ] Connect to WebSocket
   - [ ] Update UI on status changes
   - [ ] Update metrics in real-time
   - [ ] Show notifications

4. **Implement controls** (2h)
   - [ ] Start button
   - [ ] Stop button
   - [ ] Restart button
   - [ ] View logs button

5. **Implement log viewer** (2h)
   - [ ] Display logs in modal
   - [ ] Filter by level (error/warn/info)
   - [ ] Search functionality
   - [ ] Tail mode (auto-scroll)

**Acceptance Criteria:**
- [ ] UI is responsive
- [ ] Real-time updates work
- [ ] All controls functional
- [ ] Logs viewable

---

### 2.4 Implement Notification System
**Priority**: 🟡 Important  
**Time**: 8 hours  
**Dependencies**: 2.2

**Tasks:**
1. **Setup email service** (2h)
   - [ ] Configure nodemailer
   - [ ] Test email sending
   - [ ] Create email templates

2. **Define alert rules** (2h)
   ```javascript
   const alertRules = [
     {
       name: 'bot_down',
       condition: (status) => !status.whatsapp_connected,
       severity: 'critical',
       message: 'Bot {bot_id} is disconnected from WhatsApp'
     },
     {
       name: 'high_error_rate',
       condition: (metrics) => metrics.error_rate > 0.05,
       severity: 'warning',
       message: 'Bot {bot_id} has high error rate: {error_rate}%'
     },
     {
       name: 'no_activity',
       condition: (status) => Date.now() - status.last_message > 3600000,
       severity: 'info',
       message: 'Bot {bot_id} has no activity for 1 hour'
     }
   ];
   ```

3. **Implement alert engine** (3h)
   - [ ] Check rules every minute
   - [ ] Detect state changes
   - [ ] Send notifications
   - [ ] Prevent alert spam (cooldown)

4. **Test notifications** (1h)
   - [ ] Test each alert type
   - [ ] Verify email delivery
   - [ ] Test cooldown logic

**Acceptance Criteria:**
- [ ] Alerts sent when conditions met
- [ ] Emails delivered successfully
- [ ] No alert spam

---

## Phase 3: Automation Scripts (Week 3-4)

### 3.1 Create add-client.sh Script
**Priority**: 🔴 Blocker  
**Time**: 10 hours  
**Dependencies**: 1.2, 1.3, 1.4

**Script Structure:**
```bash
#!/bin/bash
# scripts/add-client.sh

# 1. Prompt for client details
# 2. Validate input
# 3. Clone template
# 4. Generate configuration
# 5. Assign ports
# 6. Create directory structure
# 7. Configure PM2
# 8. Open firewall ports
# 9. Output instructions
```

**Tasks:**
1. **Implement interactive prompts** (2h)
   - [ ] Client ID
   - [ ] Client name
   - [ ] Business details
   - [ ] Number of locations
   - [ ] Confirmation

2. **Implement template cloning** (2h)
   - [ ] Copy template to clients/{client-id}
   - [ ] Replace placeholders
   - [ ] Generate config.json

3. **Implement port assignment** (1h)
   - [ ] Call port-manager.js
   - [ ] Update config with ports
   - [ ] Update port registry

4. **Implement PM2 configuration** (2h)
   - [ ] Generate PM2 ecosystem file
   - [ ] Start processes
   - [ ] Verify startup

5. **Implement firewall configuration** (1h)
   - [ ] Open assigned ports
   - [ ] Verify ports open

6. **Test script** (2h)
   - [ ] Test with valid input
   - [ ] Test with invalid input
   - [ ] Test rollback on failure

**Acceptance Criteria:**
- [ ] Script completes in < 15 minutes
- [ ] Client ready to scan QR
- [ ] All ports open
- [ ] PM2 processes running

---

### 3.2 Create update-client.sh Script
**Priority**: 🟡 Important  
**Time**: 8 hours  
**Dependencies**: 3.1

**Script Structure:**
```bash
#!/bin/bash
# scripts/update-client.sh <client-id> [--version v2.0.0]

# 1. Backup current version
# 2. Pull new code
# 3. Run tests
# 4. Stop bot
# 5. Start bot with new code
# 6. Verify health
# 7. If fail → rollback
```

**Tasks:**
1. **Implement backup** (2h)
   - [ ] Backup code
   - [ ] Backup database
   - [ ] Backup config

2. **Implement update logic** (3h)
   - [ ] Pull from git/template
   - [ ] Install dependencies
   - [ ] Run migrations if needed

3. **Implement health verification** (2h)
   - [ ] Check bot starts
   - [ ] Check WhatsApp connects
   - [ ] Check health endpoint

4. **Implement rollback** (1h)
   - [ ] Restore from backup
   - [ ] Restart with old version

**Acceptance Criteria:**
- [ ] Updates work without manual intervention
- [ ] Rollback works if update fails
- [ ] Zero downtime (< 30 seconds)

---

### 3.3 Create backup-client.sh Script
**Priority**: 🟡 Important  
**Time**: 6 hours  
**Dependencies**: None

**Script Structure:**
```bash
#!/bin/bash
# scripts/backup-client.sh <client-id>

# 1. Stop bot (optional)
# 2. Backup database
# 3. Backup WhatsApp session
# 4. Backup configuration
# 5. Compress
# 6. Store in backup location
# 7. Verify integrity
# 8. Restart bot
```

**Tasks:**
1. **Implement backup logic** (3h)
   - [ ] Backup all critical files
   - [ ] Compress with tar.gz
   - [ ] Add timestamp to filename

2. **Implement storage** (2h)
   - [ ] Store locally
   - [ ] Optional: Upload to cloud
   - [ ] Implement retention policy

3. **Implement verification** (1h)
   - [ ] Verify backup integrity
   - [ ] Test restore (dry-run)

**Acceptance Criteria:**
- [ ] Backups complete successfully
- [ ] Backups can be restored
- [ ] Automated via cron

---

### 3.4 Create health-check.sh Script
**Priority**: 🟢 Nice to have  
**Time**: 4 hours  
**Dependencies**: 2.2

**Script Structure:**
```bash
#!/bin/bash
# scripts/health-check.sh

# 1. Check all bots
# 2. Verify WhatsApp connections
# 3. Check disk space
# 4. Check memory usage
# 5. Report status
```

**Tasks:**
1. **Implement checks** (2h)
   - [ ] Query health endpoints
   - [ ] Check system resources
   - [ ] Check disk space

2. **Implement reporting** (2h)
   - [ ] Generate report
   - [ ] Send email if issues
   - [ ] Log results

**Acceptance Criteria:**
- [ ] Detects all common issues
- [ ] Reports clearly
- [ ] Can run via cron

---

## Phase 4: Client & Human Dashboards (Week 4-5)

### 4.1 Refactor Dashboard Cliente
**Priority**: 🟡 Important  
**Time**: 12 hours  
**Dependencies**: 2.1

**Tasks:**
1. **Multi-location support** (4h)
   - [ ] Display multiple locations
   - [ ] Aggregated statistics
   - [ ] Individual location stats

2. **Implement navigation** (2h)
   - [ ] Location selector
   - [ ] Link to human dashboards
   - [ ] Breadcrumbs

3. **Implement statistics** (4h)
   - [ ] Total messages today
   - [ ] Active conversations
   - [ ] Response time
   - [ ] Error rate

4. **Test dashboard** (2h)
   - [ ] Test with multiple locations
   - [ ] Test statistics accuracy
   - [ ] Test navigation

**Acceptance Criteria:**
- [ ] Shows all client locations
- [ ] Statistics accurate
- [ ] Navigation intuitive

---

### 4.2 Implement Access Control
**Priority**: 🔴 Blocker  
**Time**: 8 hours  
**Dependencies**: 4.1

**Tasks:**
1. **Define access levels** (2h)
   ```javascript
   const roles = {
     admin: ['*'],  // All access
     client: ['clients/{client_id}/*'],  // Only their data
     employee: ['clients/{client_id}/{location_id}/*']  // Only their location
   };
   ```

2. **Implement authentication** (3h)
   - [ ] Simple password per dashboard
   - [ ] Session management
   - [ ] Logout functionality

3. **Implement authorization** (2h)
   - [ ] Check permissions on each request
   - [ ] Return 403 if unauthorized
   - [ ] Filter data by permissions

4. **Test access control** (1h)
   - [ ] Test admin access
   - [ ] Test client access
   - [ ] Test employee access
   - [ ] Test unauthorized access

**Acceptance Criteria:**
- [ ] Clients cannot see other clients
- [ ] Employees cannot see other locations
- [ ] Admin can see everything

---

### 4.3 Enhance Dashboard Humano
**Priority**: 🟡 Important  
**Time**: 8 hours  
**Dependencies**: 4.2

**Tasks:**
1. **Improve conversation view** (3h)
   - [ ] Better UI/UX
   - [ ] Message timestamps
   - [ ] User info display
   - [ ] Conversation status

2. **Implement takeover** (3h)
   - [ ] Pause bot button
   - [ ] Human response input
   - [ ] Resume bot button
   - [ ] Takeover history

3. **Add features** (2h)
   - [ ] Search conversations
   - [ ] Filter by status
   - [ ] Export conversation

**Acceptance Criteria:**
- [ ] Takeover works smoothly
- [ ] UI is intuitive
- [ ] All features functional

---

## Phase 5: Migration & Testing (Week 5-6)

### 5.1 Create Migration Script
**Priority**: 🔴 Blocker  
**Time**: 10 hours  
**Dependencies**: All previous phases

**Script Structure:**
```bash
#!/bin/bash
# scripts/migrate-to-multitenant.sh

# 1. Detect current setup
# 2. Backup everything
# 3. Stop current bots
# 4. Convert to new structure
# 5. Update PM2 configs
# 6. Start new structure
# 7. Verify everything works
```

**Tasks:**
1. **Implement detection** (2h)
   - [ ] Find bot_dolce
   - [ ] Find bot_testing
   - [ ] Detect configuration

2. **Implement conversion** (4h)
   - [ ] Create client structure
   - [ ] Move data
   - [ ] Move sessions
   - [ ] Generate configs

3. **Implement PM2 migration** (2h)
   - [ ] Stop old processes
   - [ ] Start new processes
   - [ ] Update saved config

4. **Implement verification** (2h)
   - [ ] Check all bots running
   - [ ] Check WhatsApp connected
   - [ ] Check data intact

**Acceptance Criteria:**
- [ ] Migration completes successfully
- [ ] Zero data loss
- [ ] All functionality preserved

---

### 5.2 Test Migration in Staging
**Priority**: 🔴 Blocker  
**Time**: 8 hours  
**Dependencies**: 5.1

**Tasks:**
1. **Setup staging environment** (2h)
   - [ ] Clone production
   - [ ] Use test WhatsApp numbers

2. **Run migration** (2h)
   - [ ] Execute migration script
   - [ ] Monitor for errors
   - [ ] Document issues

3. **Verify functionality** (3h)
   - [ ] Test all dashboards
   - [ ] Test bot responses
   - [ ] Test human takeover
   - [ ] Test monitoring

4. **Test rollback** (1h)
   - [ ] Restore from backup
   - [ ] Verify old setup works

**Acceptance Criteria:**
- [ ] Migration successful in staging
- [ ] All tests pass
- [ ] Rollback works

---

### 5.3 Migrate Production (Dolce Party)
**Priority**: 🔴 Blocker  
**Time**: 4 hours  
**Dependencies**: 5.2

**Tasks:**
1. **Pre-migration** (1h)
   - [ ] Schedule maintenance window
   - [ ] Notify client
   - [ ] Full backup

2. **Execute migration** (1h)
   - [ ] Run migration script
   - [ ] Monitor closely

3. **Verify** (1h)
   - [ ] Check all bots
   - [ ] Check WhatsApp sessions
   - [ ] Check dashboards
   - [ ] Test functionality

4. **Monitor** (1h)
   - [ ] Watch for 1 hour
   - [ ] Check logs
   - [ ] Verify metrics

**Acceptance Criteria:**
- [ ] Migration successful
- [ ] Client satisfied
- [ ] No issues detected

---

## Phase 6: Documentation & Polish (Week 6)

### 6.1 Write Operator Documentation
**Priority**: 🟡 Important  
**Time**: 8 hours  
**Dependencies**: All phases

**Documents to create:**
1. **Operator Manual** (4h)
   - [ ] How to add a client
   - [ ] How to update clients
   - [ ] How to backup/restore
   - [ ] How to troubleshoot

2. **Runbooks** (4h)
   - [ ] Bot goes down
   - [ ] WhatsApp disconnects
   - [ ] Server full
   - [ ] High error rate

**Acceptance Criteria:**
- [ ] Documentation complete
- [ ] Clear and actionable
- [ ] Tested by following steps

---

### 6.2 Write Client Documentation
**Priority**: 🟢 Nice to have  
**Time**: 4 hours  
**Dependencies**: 4.1, 4.3

**Documents to create:**
1. **Client Guide** (2h)
   - [ ] How to access dashboard
   - [ ] How to read statistics
   - [ ] How to use human takeover

2. **FAQ** (2h)
   - [ ] Common questions
   - [ ] Troubleshooting tips

**Acceptance Criteria:**
- [ ] Client can use system without help
- [ ] FAQ covers common issues

---

### 6.3 Final Testing & Optimization
**Priority**: 🟡 Important  
**Time**: 8 hours  
**Dependencies**: All phases

**Tasks:**
1. **Load testing** (3h)
   - [ ] Simulate multiple clients
   - [ ] Simulate high message volume
   - [ ] Measure performance

2. **Security audit** (2h)
   - [ ] Check access control
   - [ ] Check data isolation
   - [ ] Check for vulnerabilities

3. **Performance optimization** (2h)
   - [ ] Optimize slow queries
   - [ ] Reduce memory usage
   - [ ] Improve response times

4. **Bug fixes** (1h)
   - [ ] Fix any issues found
   - [ ] Retest

**Acceptance Criteria:**
- [ ] System handles expected load
- [ ] No security issues
- [ ] Performance acceptable

---

## 📊 Progress Tracking

### Week 1-2: Foundation
- [ ] Phase 1.1 Complete
- [ ] Phase 1.2 Complete
- [ ] Phase 1.3 Complete
- [ ] Phase 1.4 Complete

### Week 2-3: Dashboard Maestro
- [ ] Phase 2.1 Complete
- [ ] Phase 2.2 Complete
- [ ] Phase 2.3 Complete
- [ ] Phase 2.4 Complete

### Week 3-4: Automation
- [ ] Phase 3.1 Complete
- [ ] Phase 3.2 Complete
- [ ] Phase 3.3 Complete
- [ ] Phase 3.4 Complete

### Week 4-5: Dashboards
- [ ] Phase 4.1 Complete
- [ ] Phase 4.2 Complete
- [ ] Phase 4.3 Complete

### Week 5-6: Migration
- [ ] Phase 5.1 Complete
- [ ] Phase 5.2 Complete
- [ ] Phase 5.3 Complete

### Week 6: Documentation
- [ ] Phase 6.1 Complete
- [ ] Phase 6.2 Complete
- [ ] Phase 6.3 Complete

---

## 🎯 Next Steps

1. Review this plan
2. Adjust timeline if needed
3. Begin Phase 1.1
4. Track progress weekly

---

**Total Estimated Time**: 200 hours  
**Timeline**: 4-6 weeks (depending on availability)  
**Status**: Ready to start
