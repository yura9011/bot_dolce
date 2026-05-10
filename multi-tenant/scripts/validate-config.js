#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv();
addFormats(ajv);

// Load schema
const schemaPath = process.env.CLIENT_SCHEMA_PATH || 
  path.join(__dirname, '..', 'config', 'client-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

// Load config
const configPath = process.argv[2];
if (!configPath) {
  console.error('Usage: validate-config.js <config-file>');       
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));   

// Validate
const valid = validate(config);

if (valid) {
  console.log('✅ Configuration is valid');
  process.exit(0);
} else {
  console.error('❌ Configuration is invalid:');
  console.error(validate.errors);
  process.exit(1);
}
