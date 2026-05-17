const path = require('path');
const { execFile } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const DEFAULT_TIMEOUT_MS = parseInt(process.env.DASHBOARD_MAESTRO_BACKUP_TIMEOUT_MS, 10) || 120000;

function getBackupConfig() {
  return {
    enabled: process.env.DASHBOARD_MAESTRO_ENABLE_BACKUP_NOW === 'true',
    scriptPath: process.env.DASHBOARD_MAESTRO_BACKUP_SCRIPT || null,
    timeoutMs: DEFAULT_TIMEOUT_MS
  };
}

function runBackupNow() {
  const config = getBackupConfig();

  if (!config.enabled) {
    const error = new Error('Backup now deshabilitado');
    error.code = 'BACKUP_DISABLED';
    return Promise.reject(error);
  }

  if (!config.scriptPath) {
    const error = new Error('DASHBOARD_MAESTRO_BACKUP_SCRIPT no configurado');
    error.code = 'BACKUP_SCRIPT_MISSING';
    return Promise.reject(error);
  }

  const resolvedScript = path.resolve(REPO_ROOT, config.scriptPath);

  return new Promise((resolve, reject) => {
    execFile('bash', [resolvedScript], { cwd: REPO_ROOT, timeout: config.timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        error.scriptPath = resolvedScript;
        return reject(error);
      }

      resolve({
        scriptPath: resolvedScript,
        stdout,
        stderr
      });
    });
  });
}

module.exports = {
  getBackupConfig,
  runBackupNow
};
