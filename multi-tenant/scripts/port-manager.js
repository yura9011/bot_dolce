#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = process.env.PORT_REGISTRY_PATH || 
  path.join(__dirname, '..', 'config', 'port-registry.json');    

class PortManager {
  constructor() {
    this.loadRegistry();
  }

  loadRegistry() {
    if (fs.existsSync(REGISTRY_FILE)) {
      this.registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    } else {
      throw new Error(`Port registry not found at: ${REGISTRY_FILE}`);
    }
  }

  saveRegistry() {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(this.registry, null, 2));
  }

  assignDashboard(clientId) {
    if (this.registry.clients[clientId]) {
      throw new Error(`Client ${clientId} already exists`);       
    }

    const port = this.registry.next_available;
    this.registry.next_available += 10;  // Reserve block of 10   
    this.registry.reserved.push(port);

    this.registry.clients[clientId] = { dashboard: port, bots: [] 
};
    this.saveRegistry();

    return port;
  }

  assignBots(clientId, count) {
    if (!this.registry.clients[clientId]) {
      throw new Error(`Client ${clientId} not found`);
    }

    const ports = [];
    const basePort = this.registry.clients[clientId].dashboard + 1;

    for (let i = 0; i < count; i++) {
      const port = basePort + i;

      if (this.registry.reserved.includes(port)) {
        throw new Error(`Port ${port} already reserved`);
      }

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

    delete this.registry.clients[clientId];
    this.saveRegistry();
  }

  list() {
    return this.registry;
  }

  isAvailable(port) {
    return !this.registry.reserved.includes(port);
  }
}

// CLI
const manager = new PortManager();
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

try {
  switch (command) {
    case 'assign-dashboard':
      if (!arg1) throw new Error('Client ID required');
      console.log(manager.assignDashboard(arg1));
      break;

    case 'assign-bots':
      if (!arg1 || !arg2) throw new Error('Client ID and count required');
      console.log(manager.assignBots(arg1, parseInt(arg2)).join(' '));
      break;

    case 'release':
      if (!arg1) throw new Error('Client ID required');
      manager.release(arg1);
      console.log(`Released ports for ${arg1}`);
      break;

    case 'list':
      console.log(JSON.stringify(manager.list(), null, 2));       
      break;

    case 'check':
      if (!arg1) throw new Error('Port required');
      const available = manager.isAvailable(parseInt(arg1));      
      console.log(available ? 'Available' : 'Reserved');
      process.exit(available ? 0 : 1);
      break;

    default:
      console.error('Usage: port-manager.js <command> [args]');   
      console.error('Commands:');
      console.error('  assign-dashboard <client-id>');
      console.error('  assign-bots <client-id> <count>');
      console.error('  release <client-id>');
      console.error('  list');
      console.error('  check <port>');
      process.exit(1);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
