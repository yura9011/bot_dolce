#!/usr/bin/env node
/**
 * jira-daily-log.js
 * Crea un issue diario en Jira con el resumen de la sesión del día.
 * Lee el journal del día desde .gsd/memory/journal/ y lo postea.
 *
 * Uso:
 *   node scripts/jira-daily-log.js
 *   node scripts/jira-daily-log.js --summary "Texto manual del resumen"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const JIRA_HOST = 'formadigital.atlassian.net';
const JIRA_EMAIL = 'forma.digital.ar@gmail.com';
const JIRA_TOKEN = process.env.JIRA_TOKEN || 'ATATT3xFfGF09yjALnpRPc_PNnT2gk1uIuKtgg_Y4yGhxLk7qW7e9-L0JcjI3xkrooAtSZOmiEa2lX9SKb8Hrae708jd512RrISjiMb0hns_w0zQeEir1ALCr2FdCt0rdW6Qu-mlDdlKaimkMWtMJ6gQVQGmjlVeZP4vO7oKKN2xbvNymyqcbsA=013E34A8';
const JIRA_PROJECT_KEY = 'SCRUM';

// ── Helpers ──────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function readTodayJournal() {
  const journalDir = path.join(__dirname, '../.gsd/memory/journal');
  if (!fs.existsSync(journalDir)) return null;

  const date = today();
  const files = fs.readdirSync(journalDir).filter(f => f.startsWith(date));
  if (files.length === 0) return null;

  // Si hay varios journals del día, los concatena
  return files.map(f => {
    const content = fs.readFileSync(path.join(journalDir, f), 'utf8');
    return `### ${f}\n\n${content}`;
  }).join('\n\n---\n\n');
}

function buildSummary() {
  // Permite pasar resumen manual via --summary "texto"
  const summaryIdx = process.argv.indexOf('--summary');
  if (summaryIdx !== -1 && process.argv[summaryIdx + 1]) {
    return process.argv[summaryIdx + 1];
  }

  const journal = readTodayJournal();
  if (journal) return journal;

  return `Sesión de desarrollo del ${today()}. Sin journal automático disponible.`;
}

function jiraRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: JIRA_HOST,
      path,
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseData) });
        } catch {
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const date = today();
  const summary = buildSummary();

  console.log(`📋 Creando issue diario en Jira para ${date}...`);

  // Truncar descripción si es muy larga (Jira tiene límite)
  const maxLen = 32000;
  const description = summary.length > maxLen
    ? summary.substring(0, maxLen) + '\n\n... (truncado)'
    : summary;

  const issueBody = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: `[Dev Log] ${date} — Resumen de sesión`,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: description }]
          }
        ]
      },
      issuetype: { name: 'Task' }
    }
  };

  const result = await jiraRequest('POST', '/rest/api/3/issue', issueBody);

  if (result.status === 201) {
    const issue = result.body;
    console.log(`✅ Issue creado: ${issue.key}`);
    console.log(`🔗 https://formadigital.atlassian.net/browse/${issue.key}`);
  } else {
    console.error(`❌ Error ${result.status}:`, JSON.stringify(result.body, null, 2));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Error inesperado:', err.message);
  process.exit(1);
});
