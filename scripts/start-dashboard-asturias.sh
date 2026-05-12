#!/bin/bash
# Inicia el dashboard humano para el agente asturias
DASHBOARD_HUMANO_PORT=3002 \
DASHBOARD_AGENT_ID=asturias \
BOT_API_PORT=3012 \
CONFIG_AGENT_ID=asturias \
pm2 start /home/forma/bot_dolce/dashboard-humano-v2/server.js \
  --name dashboard-humano-asturias \
  --cwd /home/forma/bot_dolce/dashboard-humano-v2
