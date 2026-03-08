#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[x]${NC} $*" >&2; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ─────────────────────────────────────────────────────────────
# 1. Docker
# ─────────────────────────────────────────────────────────────
install_docker() {
    warn "Docker не найден. Устанавливаю..."
    apt-get update -qq
    apt-get install -y -qq ca-certificates curl >/dev/null
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
        > /etc/apt/sources.list.d/docker.list

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin >/dev/null
    systemctl enable --now docker
    log "Docker установлен."
}

if command -v docker &>/dev/null; then
    log "Docker: $(docker --version)"
else
    install_docker
fi

if docker compose version &>/dev/null; then
    log "Docker Compose: $(docker compose version --short)"
else
    err "Docker Compose plugin не найден."
    exit 1
fi

# ─────────────────────────────────────────────────────────────
# 2. Insecure registry (localhost:5000)
# ─────────────────────────────────────────────────────────────
DAEMON_JSON="/etc/docker/daemon.json"
if [ ! -f "$DAEMON_JSON" ] || ! grep -q "localhost:5000" "$DAEMON_JSON" 2>/dev/null; then
    mkdir -p /etc/docker
    python3 -c "
import json, os
cfg = {}
if os.path.exists('$DAEMON_JSON'):
    cfg = json.load(open('$DAEMON_JSON'))
regs = set(cfg.get('insecure-registries', []))
regs.add('localhost:5000')
cfg['insecure-registries'] = sorted(regs)
json.dump(cfg, open('$DAEMON_JSON','w'), indent=2)
"
    systemctl restart docker
    log "daemon.json обновлён: localhost:5000 в insecure-registries."
else
    log "localhost:5000 уже в insecure-registries."
fi

# ─────────────────────────────────────────────────────────────
# 3. Директории
# ─────────────────────────────────────────────────────────────
mkdir -p nginx/auth nginx/ssl registry/auth
log "Директории созданы."

# ─────────────────────────────────────────────────────────────
# 4. .env
# ─────────────────────────────────────────────────────────────
gen_pass() { openssl rand -base64 24 | tr -d '/+=' | head -c 32; }

if [ ! -f .env ]; then
    cp .env.example .env
    sed -i "s/CHANGE_ME_postgres_password/$(gen_pass)/"       .env
    sed -i "s/CHANGE_ME_pgadmin_password/$(gen_pass)/"        .env
    sed -i "s/CHANGE_ME_nginx_admin_password/$(gen_pass)/"    .env
    sed -i "s/CHANGE_ME_registry_password/$(gen_pass)/"       .env
    chmod 600 .env
    log ".env создан со случайными паролями."
else
    warn ".env уже существует, пропускаю."
fi

source .env

# ─────────────────────────────────────────────────────────────
# 5. htpasswd — Registry
# ─────────────────────────────────────────────────────────────
if [ ! -f registry/auth/htpasswd ]; then
    docker run --rm --entrypoint htpasswd httpd:2-alpine \
        -Bbn "${REGISTRY_USER}" "${REGISTRY_PASSWORD}" \
        > registry/auth/htpasswd
    chmod 600 registry/auth/htpasswd
    log "Registry htpasswd создан (user: ${REGISTRY_USER})."
else
    warn "registry/auth/htpasswd существует, пропускаю."
fi

# ─────────────────────────────────────────────────────────────
# 6. htpasswd — Nginx Basic Auth (pgAdmin)
# ─────────────────────────────────────────────────────────────
if [ ! -f nginx/auth/.htpasswd_admin ]; then
    docker run --rm --entrypoint htpasswd httpd:2-alpine \
        -Bbn "${NGINX_ADMIN_USER}" "${NGINX_ADMIN_PASSWORD}" \
        > nginx/auth/.htpasswd_admin
    chmod 600 nginx/auth/.htpasswd_admin
    log "Nginx admin htpasswd создан (user: ${NGINX_ADMIN_USER})."
else
    warn "nginx/auth/.htpasswd_admin существует, пропускаю."
fi

# ─────────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  Setup complete"
echo "=========================================="
echo ""
echo "  docker compose up -d"
echo ""
echo "  docker login localhost:5000 -u ${REGISTRY_USER}"
echo "  docker tag myimg localhost:5000/autovip-backend:latest"
echo "  docker push localhost:5000/autovip-backend:latest"
echo ""
echo "=========================================="
