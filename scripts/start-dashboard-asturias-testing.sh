#!/bin/bash
DASHBOARD_HUMANO_PORT=4003 \
DASHBOARD_AGENT_ID=asturias \
BOT_API_PORT=4012 \
CONFIG_AGENT_ID=asturias \
NODE_ENV=development \
pm2 start /home/forma/bot_testing/dashboard-humano-v2/server.js \
  --name dashboard-humano-asturias-testing \
  --cwd /home/forma/bot_testing/dashboard-humano-v2
