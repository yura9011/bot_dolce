# Scripts Design & Specifications

**Project**: Hybrid Multi-Tenant WhatsApp Bot Platform  
**Purpose**: Detailed technical specifications for automation scripts  
**Last Updated**: 2026-05-10

---

## 📋 Overview

This document provides detailed specifications for all automation scripts needed for the multi-tenant platform.

### Scripts to Create:
1. `add-client.sh` - Add new client
2. `update-client.sh` - Update existing client
3. `backup-client.sh` - Backup client data
4. `health-check.sh` - System health check
5. `remove-client.sh` - Remove client
6. `migrate-to-multitenant.sh` - Migration script

---

## 1. add-client.sh

### Purpose
Automate the process of adding a new client to the platform.

### Usage
```bash
./scripts/add-client.sh [--non-interactive]
```

### Flow Diagram
```
Start
  ↓
Prompt for client details
  ↓
Validate input
  ↓
Check if client exists → Yes → Error & Exit
  ↓ No
Assign ports
  ↓
Clone template
  ↓
Generate configuration
  ↓
Create directory structure
  ↓
Configure PM2
  ↓
Open firewall ports
  ↓
Output instructions
  ↓
End
```

### Detailed Specification

#### Input Prompts
```bash
# 1. Client ID
read -p "Client ID (lowercase, no spaces, e.g., 'dolce-party'): " CLIENT_ID
# Validation: ^[a-z0-9-]+$

# 2. Client Name
read -p "Client Name (e.g., 'Dolce Party - Santa Ana'): " CLIENT_NAME

# 3. Business Phone
read -p "Business Phone (with country code): " BUSINESS_PHONE
# Validation: ^[0-9+ -]+$

# 4. Business Address
read -p "Business Address: " BUSINESS_ADDRESS

# 5. Business Hours
read -p "Business Hours (e.g., 'Lun-Sáb: 9-20hs'): " BUSINESS_HOURS

# 6. Number of Locations
read -p "Number of locations/bots: " NUM_LOCATIONS
# Validation: ^[1-9][0-9]*$

# 7. Admin WhatsApp Number
read -p "Admin WhatsApp Number (with country code): " ADMIN_NUMBER
# Validation: ^[0-9]+$

# 8. Confirmation
echo ""
echo "Summary:"
echo "  Client ID: $CLIENT_ID"
echo "  Name: $CLIENT_NAME"
echo "  Locations: $NUM_LOCATIONS"
echo ""
read -p "Proceed? (y/n): " CONFIRM
```

#### Port Assignment
```bash
# Call port manager
DASHBOARD_PORT=$(node /home/forma/scripts/port-manager.js assign-dashboard)
BOT_PORTS=$(node /home/forma/scripts/port-manager.js assign-bots $NUM_LOCATIONS)

# Example output:
# DASHBOARD_PORT=5000
# BOT_PORTS="5001 5002 5003"
```

#### Directory Creation
```bash
BASE_DIR="/home/forma/clients/$CLIENT_ID"

# Create structure
mkdir -p "$BASE_DIR"
mkdir -p "$BASE_DIR/config"

# For each location
for i in $(seq 1 $NUM_LOCATIONS); do
  LOCATION_NAME="local-$i"
  mkdir -p "$BASE_DIR/$LOCATION_NAME"/{bot,data,logs,catalogs,.wwebjs_auth}
done

# Set permissions
chown -R forma:forma "$BASE_DIR"
chmod -R 755 "$BASE_DIR"
```

#### Configuration Generation
```bash
# Generate client config
cat > "$BASE_DIR/config/client.json" <<EOF
{
  "client_id": "$CLIENT_ID",
  "name": "$CLIENT_NAME",
  "enabled": true,
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ports": {
    "dashboard": $DASHBOARD_PORT,
    "bots": [$BOT_PORTS_ARRAY]
  },
  "business": {
    "name": "$CLIENT_NAME",
    "phone": "$BUSINESS_PHONE",
    "address": "$BUSINESS_ADDRESS",
    "hours": "$BUSINESS_HOURS"
  },
  "admins": ["$ADMIN_NUMBER"],
  "features": {
    "voice_messages": false,
    "payments": false
  }
}
EOF
```

#### Template Cloning
```bash
# Clone template for each location
TEMPLATE_DIR="/home/forma/templates/bot-template"

for i in $(seq 1 $NUM_LOCATIONS); do
  LOCATION_NAME="local-$i"
  LOCATION_DIR="$BASE_DIR/$LOCATION_NAME"
  
  # Copy bot code
  cp -r "$TEMPLATE_DIR/bot" "$LOCATION_DIR/"
  
  # Copy catalog template
  cp "$TEMPLATE_DIR/catalogs/catalogo.template.js" \
     "$LOCATION_DIR/catalogs/catalogo.js"
  
  # Generate .env
  cat > "$LOCATION_DIR/.env" <<EOF
CLIENT_ID=$CLIENT_ID
LOCATION_ID=$LOCATION_NAME
PORT=${BOT_PORTS[$i-1]}
GEMINI_API_KEY=\${GEMINI_API_KEY}
OPENROUTER_API_KEY=\${OPENROUTER_API_KEY}
SYSTEM_PROMPT=\${SYSTEM_PROMPT}
EOF
done
```

#### PM2 Configuration
```bash
# Generate PM2 ecosystem file
cat > "$BASE_DIR/ecosystem.config.js" <<EOF
module.exports = {
  apps: [
    {
      name: 'dashboard-$CLIENT_ID',
      script: './dashboard-cliente.js',
      cwd: '$BASE_DIR',
      env: {
        PORT: $DASHBOARD_PORT,
        CLIENT_ID: '$CLIENT_ID'
      }
    },
EOF

# Add bot processes
for i in $(seq 1 $NUM_LOCATIONS); do
  LOCATION_NAME="local-$i"
  BOT_PORT=${BOT_PORTS[$i-1]}
  
  cat >> "$BASE_DIR/ecosystem.config.js" <<EOF
    {
      name: 'bot-$CLIENT_ID-$LOCATION_NAME',
      script: './bot/index.js',
      cwd: '$BASE_DIR/$LOCATION_NAME',
      env: {
        PORT: $BOT_PORT,
        CLIENT_ID: '$CLIENT_ID',
        LOCATION_ID: '$LOCATION_NAME'
      }
    },
EOF
done

cat >> "$BASE_DIR/ecosystem.config.js" <<EOF
  ]
};
EOF

# Start with PM2
pm2 start "$BASE_DIR/ecosystem.config.js"
pm2 save
```

#### Firewall Configuration
```bash
# Open dashboard port
sudo ufw allow $DASHBOARD_PORT/tcp

# Open bot ports
for PORT in $BOT_PORTS; do
  sudo ufw allow $PORT/tcp
done

# Verify
sudo ufw status | grep -E "($DASHBOARD_PORT|$(echo $BOT_PORTS | tr ' ' '|'))"
```

#### Output Instructions
```bash
echo ""
echo "✅ Client '$CLIENT_ID' added successfully!"
echo ""
echo "📊 Dashboard: http://$(hostname -I | awk '{print $1}'):$DASHBOARD_PORT"
echo ""
echo "📱 Next steps:"
echo "  1. Scan QR codes for each location:"
for i in $(seq 1 $NUM_LOCATIONS); do
  LOCATION_NAME="local-$i"
  echo "     - $LOCATION_NAME: pm2 logs bot-$CLIENT_ID-$LOCATION_NAME --lines 50"
done
echo ""
echo "  2. Edit catalogs:"
for i in $(seq 1 $NUM_LOCATIONS); do
  LOCATION_NAME="local-$i"
  echo "     - nano $BASE_DIR/$LOCATION_NAME/catalogs/catalogo.js"
done
echo ""
echo "🔧 Management commands:"
echo "  - View logs: pm2 logs bot-$CLIENT_ID-local-1"
echo "  - Restart: pm2 restart bot-$CLIENT_ID-local-1"
echo "  - Stop: pm2 stop bot-$CLIENT_ID-local-1"
echo "  - Remove: ./scripts/remove-client.sh $CLIENT_ID"
echo ""
```

### Error Handling
```bash
set -e  # Exit on error

# Trap errors
trap 'handle_error $? $LINENO' ERR

handle_error() {
  echo "❌ Error on line $2 (exit code $1)"
  echo "Rolling back..."
  
  # Rollback actions
  if [ -d "$BASE_DIR" ]; then
    pm2 delete "bot-$CLIENT_ID-*" 2>/dev/null || true
    pm2 delete "dashboard-$CLIENT_ID" 2>/dev/null || true
    rm -rf "$BASE_DIR"
  fi
  
  # Release ports
  node /home/forma/scripts/port-manager.js release $CLIENT_ID
  
  echo "Rollback complete"
  exit 1
}
```

### Testing
```bash
# Test cases
./scripts/add-client.sh  # Interactive mode
./scripts/add-client.sh --non-interactive \
  --client-id test-client \
  --name "Test Client" \
  --phone "+54351123456" \
  --locations 2
```

---

## 2. update-client.sh

### Purpose
Update an existing client's code to a new version.

### Usage
```bash
./scripts/update-client.sh <client-id> [--version <version>] [--force]
```

### Flow Diagram
```
Start
  ↓
Validate client exists → No → Error & Exit
  ↓ Yes
Backup current version
  ↓
Pull new code
  ↓
Run tests
  ↓
Stop bots
  ↓
Start bots with new code
  ↓
Verify health → Fail → Rollback
  ↓ Success
Clean up old backup
  ↓
End
```

### Detailed Specification

#### Backup
```bash
CLIENT_ID=$1
BASE_DIR="/home/forma/clients/$CLIENT_ID"
BACKUP_DIR="/home/forma/backups/$CLIENT_ID-$(date +%Y%m%d-%H%M%S)"

# Create backup
mkdir -p "$BACKUP_DIR"

# Backup code
cp -r "$BASE_DIR" "$BACKUP_DIR/client"

# Backup databases
for LOCATION in "$BASE_DIR"/*/; do
  if [ -f "$LOCATION/data/database.sqlite" ]; then
    cp "$LOCATION/data/database.sqlite" \
       "$BACKUP_DIR/$(basename $LOCATION)-database.sqlite"
  fi
done

# Backup PM2 config
pm2 save --force
cp ~/.pm2/dump.pm2 "$BACKUP_DIR/pm2-dump.pm2"

echo "✅ Backup created: $BACKUP_DIR"
```

#### Update Code
```bash
# Pull from template
TEMPLATE_DIR="/home/forma/templates/bot-template"
VERSION=${2:-latest}

# Update bot code for each location
for LOCATION in "$BASE_DIR"/*/; do
  if [ -d "$LOCATION/bot" ]; then
    # Backup custom files
    if [ -f "$LOCATION/bot/custom.js" ]; then
      cp "$LOCATION/bot/custom.js" "/tmp/custom-$(basename $LOCATION).js"
    fi
    
    # Update code
    rm -rf "$LOCATION/bot"
    cp -r "$TEMPLATE_DIR/bot" "$LOCATION/"
    
    # Restore custom files
    if [ -f "/tmp/custom-$(basename $LOCATION).js" ]; then
      cp "/tmp/custom-$(basename $LOCATION).js" "$LOCATION/bot/custom.js"
    fi
    
    # Install dependencies
    cd "$LOCATION/bot"
    npm install --production
  fi
done
```

#### Health Verification
```bash
verify_health() {
  local CLIENT_ID=$1
  local MAX_RETRIES=30
  local RETRY_COUNT=0
  
  echo "Verifying health..."
  
  # Get bot ports
  BOT_PORTS=$(jq -r '.ports.bots[]' "$BASE_DIR/config/client.json")
  
  for PORT in $BOT_PORTS; do
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
      # Check health endpoint
      HEALTH=$(curl -s "http://localhost:$PORT/health" || echo "")
      
      if echo "$HEALTH" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
        echo "✅ Bot on port $PORT is healthy"
        break
      fi
      
      RETRY_COUNT=$((RETRY_COUNT + 1))
      sleep 2
    done
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
      echo "❌ Bot on port $PORT failed health check"
      return 1
    fi
  done
  
  return 0
}
```

#### Rollback
```bash
rollback() {
  local BACKUP_DIR=$1
  
  echo "⚠️ Rolling back to previous version..."
  
  # Stop current bots
  pm2 delete "bot-$CLIENT_ID-*"
  pm2 delete "dashboard-$CLIENT_ID"
  
  # Restore from backup
  rm -rf "$BASE_DIR"
  cp -r "$BACKUP_DIR/client" "$BASE_DIR"
  
  # Restore PM2
  cp "$BACKUP_DIR/pm2-dump.pm2" ~/.pm2/dump.pm2
  pm2 resurrect
  
  echo "✅ Rollback complete"
}
```

---

## 3. backup-client.sh

### Purpose
Create a backup of a client's data.

### Usage
```bash
./scripts/backup-client.sh <client-id> [--destination <path>]
```

### Specification

```bash
#!/bin/bash

CLIENT_ID=$1
DEST=${2:-/home/forma/backups}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="$CLIENT_ID-$TIMESTAMP"
BACKUP_DIR="$DEST/$BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup client directory
tar -czf "$BACKUP_DIR/client.tar.gz" \
  -C /home/forma/clients \
  "$CLIENT_ID"

# Backup databases separately (for easy restore)
for DB in /home/forma/clients/$CLIENT_ID/*/data/database.sqlite; do
  if [ -f "$DB" ]; then
    LOCATION=$(basename $(dirname $(dirname "$DB")))
    cp "$DB" "$BACKUP_DIR/$LOCATION-database.sqlite"
  fi
done

# Backup WhatsApp sessions
for SESSION in /home/forma/clients/$CLIENT_ID/*/.wwebjs_auth; do
  if [ -d "$SESSION" ]; then
    LOCATION=$(basename $(dirname "$SESSION"))
    tar -czf "$BACKUP_DIR/$LOCATION-session.tar.gz" \
      -C $(dirname "$SESSION") \
      .wwebjs_auth
  fi
done

# Create manifest
cat > "$BACKUP_DIR/manifest.json" <<EOF
{
  "client_id": "$CLIENT_ID",
  "timestamp": "$TIMESTAMP",
  "files": [
    "client.tar.gz",
    $(ls "$BACKUP_DIR"/*.sqlite | xargs -n1 basename | jq -R . | jq -s .),
    $(ls "$BACKUP_DIR"/*-session.tar.gz | xargs -n1 basename | jq -R . | jq -s .)
  ]
}
EOF

# Verify backup
if tar -tzf "$BACKUP_DIR/client.tar.gz" > /dev/null 2>&1; then
  echo "✅ Backup created: $BACKUP_DIR"
  echo "Size: $(du -sh $BACKUP_DIR | cut -f1)"
else
  echo "❌ Backup verification failed"
  exit 1
fi
```

---

## 4. health-check.sh

### Purpose
Check the health of all clients and bots.

### Usage
```bash
./scripts/health-check.sh [--json] [--client <client-id>]
```

### Specification

```bash
#!/bin/bash

OUTPUT_JSON=false
SPECIFIC_CLIENT=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --json) OUTPUT_JSON=true; shift ;;
    --client) SPECIFIC_CLIENT=$2; shift 2 ;;
    *) shift ;;
  esac
done

# Initialize results
declare -A RESULTS

# Check each client
for CLIENT_DIR in /home/forma/clients/*/; do
  CLIENT_ID=$(basename "$CLIENT_DIR")
  
  # Skip if specific client requested
  if [ -n "$SPECIFIC_CLIENT" ] && [ "$CLIENT_ID" != "$SPECIFIC_CLIENT" ]; then
    continue
  fi
  
  # Read client config
  CONFIG="$CLIENT_DIR/config/client.json"
  if [ ! -f "$CONFIG" ]; then
    RESULTS["$CLIENT_ID"]="ERROR: No config found"
    continue
  fi
  
  # Get bot ports
  BOT_PORTS=$(jq -r '.ports.bots[]' "$CONFIG")
  
  # Check each bot
  for PORT in $BOT_PORTS; do
    HEALTH=$(curl -s --max-time 5 "http://localhost:$PORT/health" || echo "{}")
    
    STATUS=$(echo "$HEALTH" | jq -r '.status // "unknown"')
    WHATSAPP=$(echo "$HEALTH" | jq -r '.whatsapp_connected // false')
    MEMORY=$(echo "$HEALTH" | jq -r '.memory_mb // 0')
    
    RESULTS["$CLIENT_ID:$PORT"]="$STATUS|$WHATSAPP|$MEMORY"
  done
done

# Output results
if [ "$OUTPUT_JSON" = true ]; then
  # JSON output
  echo "{"
  for KEY in "${!RESULTS[@]}"; do
    IFS='|' read -r STATUS WHATSAPP MEMORY <<< "${RESULTS[$KEY]}"
    echo "  \"$KEY\": {"
    echo "    \"status\": \"$STATUS\","
    echo "    \"whatsapp_connected\": $WHATSAPP,"
    echo "    \"memory_mb\": $MEMORY"
    echo "  },"
  done
  echo "}"
else
  # Human-readable output
  echo "Health Check Report - $(date)"
  echo "================================"
  for KEY in "${!RESULTS[@]}"; do
    IFS='|' read -r STATUS WHATSAPP MEMORY <<< "${RESULTS[$KEY]}"
    
    # Color code status
    if [ "$STATUS" = "healthy" ] && [ "$WHATSAPP" = "true" ]; then
      COLOR="\033[0;32m"  # Green
      ICON="✅"
    else
      COLOR="\033[0;31m"  # Red
      ICON="❌"
    fi
    
    echo -e "$ICON $COLOR$KEY\033[0m - $STATUS (WhatsApp: $WHATSAPP, Memory: ${MEMORY}MB)"
  done
fi
```

---

## 5. remove-client.sh

### Purpose
Remove a client from the platform.

### Usage
```bash
./scripts/remove-client.sh <client-id> [--archive] [--force]
```

### Specification

```bash
#!/bin/bash

CLIENT_ID=$1
ARCHIVE=false
FORCE=false

# Parse arguments
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --archive) ARCHIVE=true; shift ;;
    --force) FORCE=true; shift ;;
    *) shift ;;
  esac
done

# Confirmation
if [ "$FORCE" != true ]; then
  echo "⚠️ WARNING: This will remove client '$CLIENT_ID'"
  echo "This action cannot be undone (unless --archive is used)"
  read -p "Are you sure? (type 'yes' to confirm): " CONFIRM
  
  if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled"
    exit 0
  fi
fi

# Archive if requested
if [ "$ARCHIVE" = true ]; then
  echo "Creating archive..."
  ./scripts/backup-client.sh "$CLIENT_ID" --destination /home/forma/archives
fi

# Stop PM2 processes
echo "Stopping processes..."
pm2 delete "bot-$CLIENT_ID-*" 2>/dev/null || true
pm2 delete "dashboard-$CLIENT_ID" 2>/dev/null || true
pm2 save

# Release ports
echo "Releasing ports..."
node /home/forma/scripts/port-manager.js release "$CLIENT_ID"

# Close firewall ports
CONFIG="/home/forma/clients/$CLIENT_ID/config/client.json"
if [ -f "$CONFIG" ]; then
  DASHBOARD_PORT=$(jq -r '.ports.dashboard' "$CONFIG")
  BOT_PORTS=$(jq -r '.ports.bots[]' "$CONFIG")
  
  sudo ufw delete allow $DASHBOARD_PORT/tcp
  for PORT in $BOT_PORTS; do
    sudo ufw delete allow $PORT/tcp
  done
fi

# Remove client directory
echo "Removing files..."
rm -rf "/home/forma/clients/$CLIENT_ID"

echo "✅ Client '$CLIENT_ID' removed"
if [ "$ARCHIVE" = true ]; then
  echo "📦 Archive available in /home/forma/archives"
fi
```

---

## 6. port-manager.js

### Purpose
Manage port allocation for clients.

### Usage
```javascript
// Assign dashboard port
node port-manager.js assign-dashboard

// Assign bot ports
node port-manager.js assign-bots <count>

// Release ports
node port-manager.js release <client-id>

// List all ports
node port-manager.js list
```

### Specification

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = '/home/forma/config/port-registry.json';

class PortManager {
  constructor() {
    this.loadRegistry();
  }
  
  loadRegistry() {
    if (fs.existsSync(REGISTRY_FILE)) {
      this.registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    } else {
      this.registry = {
        platform: { dashboard_maestro: 3000 },
        clients: {},
        next_available: 5000,
        reserved: [3000]
      };
    }
  }
  
  saveRegistry() {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(this.registry, null, 2));
  }
  
  assignDashboard(clientId) {
    const port = this.registry.next_available;
    this.registry.next_available += 10;  // Reserve block of 10
    this.registry.reserved.push(port);
    
    if (!this.registry.clients[clientId]) {
      this.registry.clients[clientId] = {};
    }
    this.registry.clients[clientId].dashboard = port;
    
    this.saveRegistry();
    return port;
  }
  
  assignBots(clientId, count) {
    const ports = [];
    const basePort = this.registry.clients[clientId].dashboard + 1;
    
    for (let i = 0; i < count; i++) {
      const port = basePort + i;
      ports.push(port);
      this.registry.reserved.push(port);
    }
    
    this.registry.clients[clientId].bots = ports;
    this.saveRegistry();
    
    return ports;
  }
  
  release(clientId) {
    if (!this.registry.clients[clientId]) {
      throw new Error(`Client ${clientId} not found`);
    }
    
    const client = this.registry.clients[clientId];
    
    // Remove from reserved
    this.registry.reserved = this.registry.reserved.filter(
      p => p !== client.dashboard && !client.bots.includes(p)
    );
    
    // Remove client
    delete this.registry.clients[clientId];
    
    this.saveRegistry();
  }
  
  list() {
    return this.registry;
  }
}

// CLI
const manager = new PortManager();
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

switch (command) {
  case 'assign-dashboard':
    console.log(manager.assignDashboard(arg1));
    break;
    
  case 'assign-bots':
    console.log(manager.assignBots(arg1, parseInt(arg2)).join(' '));
    break;
    
  case 'release':
    manager.release(arg1);
    console.log(`Released ports for ${arg1}`);
    break;
    
  case 'list':
    console.log(JSON.stringify(manager.list(), null, 2));
    break;
    
  default:
    console.error('Usage: port-manager.js <command> [args]');
    console.error('Commands:');
    console.error('  assign-dashboard <client-id>');
    console.error('  assign-bots <client-id> <count>');
    console.error('  release <client-id>');
    console.error('  list');
    process.exit(1);
}
```

---

## 📋 Testing Checklist

### For Each Script:
- [ ] Test with valid input
- [ ] Test with invalid input
- [ ] Test error handling
- [ ] Test rollback (if applicable)
- [ ] Test idempotency (can run multiple times)
- [ ] Test with edge cases
- [ ] Document all options
- [ ] Add help text

---

## 🎯 Next Steps

1. Implement scripts in order:
   - port-manager.js (foundation)
   - add-client.sh (most important)
   - backup-client.sh (safety)
   - update-client.sh (operations)
   - health-check.sh (monitoring)
   - remove-client.sh (cleanup)

2. Test each script thoroughly

3. Document usage in operator manual

4. Create video tutorials (optional)

---

**Status**: Ready for implementation  
**Estimated Time**: 40 hours total for all scripts
