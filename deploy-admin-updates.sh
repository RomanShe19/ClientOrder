#!/bin/bash
# Деплой обновлений админ-панели (температура лидов, сортировка, анализ)
set -e
cd "$(dirname "$0")"
echo "Building backend and frontend..."
docker compose build backend frontend
echo "Restarting backend and frontend..."
docker compose up -d backend frontend
echo "Done. Open admin panel and hard-refresh (Ctrl+Shift+R) to clear cache."
