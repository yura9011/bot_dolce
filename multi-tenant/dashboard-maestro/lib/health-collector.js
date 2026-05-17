const DEFAULT_TIMEOUT_MS = parseInt(process.env.DASHBOARD_MAESTRO_HEALTH_TIMEOUT_MS, 10) || 2500;
const lastSuccessfulChecks = new Map();
const lastErrors = new Map();

async function checkHttp(url, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });

    const checkedAt = new Date().toISOString();
    const error = response.ok ? null : `HTTP ${response.status}`;

    if (response.ok) {
      lastSuccessfulChecks.set(url, checkedAt);
      lastErrors.delete(url);
    } else {
      lastErrors.set(url, error);
    }

    return {
      status: response.ok ? 'up' : 'degraded',
      httpStatus: response.status,
      responseTimeMs: Date.now() - startedAt,
      checkedAt,
      lastSuccessfulCheck: lastSuccessfulChecks.get(url) || null,
      error,
      lastError: lastErrors.get(url) || null
    };
  } catch (error) {
    const message = error.name === 'AbortError' ? `Timeout after ${timeoutMs}ms` : error.message;
    lastErrors.set(url, message);

    return {
      status: 'down',
      httpStatus: null,
      responseTimeMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      lastSuccessfulCheck: lastSuccessfulChecks.get(url) || null,
      error: message,
      lastError: lastErrors.get(url) || null
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function collectAgentHealth(agent) {
  const apiPort = agent.ports?.api;
  const dashboardPort = agent.ports?.dashboard;

  const [botApi, humanDashboard] = await Promise.all([
    apiPort
      ? checkHttp(`http://127.0.0.1:${apiPort}/status`)
      : Promise.resolve(missingPortHealth('api')),
    dashboardPort
      ? checkHttp(`http://127.0.0.1:${dashboardPort}/`)
      : Promise.resolve(missingPortHealth('dashboard'))
  ]);

  return {
    botApi,
    humanDashboard,
    overall: summarizeHealth([botApi, humanDashboard])
  };
}

async function collectAgentsHealth(agents) {
  return Promise.all(agents.map(async (agent) => ({
    ...agent,
    health: await collectAgentHealth(agent)
  })));
}

function missingPortHealth(kind) {
  return {
    status: 'unknown',
    httpStatus: null,
    responseTimeMs: null,
    checkedAt: new Date().toISOString(),
    lastSuccessfulCheck: null,
    error: `Missing ${kind} port`,
    lastError: `Missing ${kind} port`
  };
}

function summarizeHealth(checks) {
  if (checks.some(check => check.status === 'down')) return 'critical';
  if (checks.some(check => check.status === 'degraded' || check.status === 'unknown')) return 'warning';
  return 'ok';
}

module.exports = {
  checkHttp,
  collectAgentsHealth
};
