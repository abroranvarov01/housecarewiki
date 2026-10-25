#!/usr/bin/env bash
# Deploy HouseCareWiki from this machine to the VPS.
#   ./deploy/deploy.sh                 # uses defaults below
#   VPS_HOST=1.2.3.4 ./deploy/deploy.sh
# Requires: ssh + rsync locally. If the server asks for a password, you'll be prompted
# (or install sshpass and export SSHPASS=... to run unattended).
set -euo pipefail

VPS_HOST="${VPS_HOST:-72.62.134.148}"
VPS_USER="${VPS_USER:-root}"
APP_DIR="${APP_DIR:-/opt/housecarewiki}"
DOMAIN="${DOMAIN:-housecarewiki.com}"
LE_EMAIL="${LE_EMAIL:-admin@${DOMAIN}}"

cd "$(dirname "$0")/.."

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
if [ -n "${SSHPASS:-}" ] && command -v sshpass >/dev/null 2>&1; then
  SSH_CMD=(sshpass -e ssh "${SSH_OPTS[@]}")
  RSYNC_RSH="sshpass -e ssh ${SSH_OPTS[*]}"
else
  SSH_CMD=(ssh "${SSH_OPTS[@]}")
  RSYNC_RSH="ssh ${SSH_OPTS[*]}"
fi

echo "==> Checking connection to ${VPS_USER}@${VPS_HOST}"
"${SSH_CMD[@]}" "${VPS_USER}@${VPS_HOST}" 'echo "connected: $(hostname) / $(uname -sr)"'

echo "==> Syncing project to ${APP_DIR}"
"${SSH_CMD[@]}" "${VPS_USER}@${VPS_HOST}" "mkdir -p '${APP_DIR}'"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .data --exclude .env --exclude .git --exclude '.DS_Store' \
  -e "$RSYNC_RSH" ./ "${VPS_USER}@${VPS_HOST}:${APP_DIR}/"

echo "==> Running remote setup"
"${SSH_CMD[@]}" "${VPS_USER}@${VPS_HOST}" \
  "APP_DIR='${APP_DIR}' DOMAIN='${DOMAIN}' LE_EMAIL='${LE_EMAIL}' APP_PORT='${APP_PORT:-}' bash '${APP_DIR}/deploy/remote-setup.sh'"

echo
echo "==> Smoke test"
for url in "http://${VPS_HOST}/" "https://${DOMAIN}/" "https://${DOMAIN}/sitemap.xml"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -H "Host: ${DOMAIN}" "$url" || true)
  echo "  ${url} -> HTTP ${code}"
done

# Tell IndexNow search engines (Bing, Yandex, ...) about the current URLs. Never fails the deploy.
if [ "${INDEXNOW:-1}" != "0" ]; then
  echo
  echo "==> IndexNow ping"
  DOMAIN="$DOMAIN" node scripts/indexnow.cjs || echo "  (IndexNow ping failed; the site is deployed anyway)"
fi
