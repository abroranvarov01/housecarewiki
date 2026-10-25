#!/usr/bin/env bash
# Runs ON the VPS (as root). Installs Docker, Nginx, Certbot, builds and starts HouseCareWiki,
# configures the reverse proxy and issues a Let's Encrypt certificate.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/housecarewiki}"
DOMAIN="${DOMAIN:-housecarewiki.com}"
LE_EMAIL="${LE_EMAIL:-admin@${DOMAIN}}"

export DEBIAN_FRONTEND=noninteractive

echo "==> [1/6] Base packages"
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg nginx certbot python3-certbot-nginx >/dev/null

echo "==> [2/6] Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker >/dev/null 2>&1 || true

echo "==> [3/6] Pick a free host port for the app (default 3000)"
cd "$APP_DIR"
APP_PORT="${APP_PORT:-}"
if [ -z "$APP_PORT" ] && [ -f .env ]; then
  APP_PORT="$(grep -E '^APP_PORT=' .env | cut -d= -f2 || true)"
fi
if [ -z "$APP_PORT" ]; then
  APP_PORT=3000
  # If 3000 is taken by something that is NOT our container, move to the next free port.
  while ss -ltn "( sport = :${APP_PORT} )" | grep -q LISTEN \
        && ! docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null | grep -q "housecarewiki-web .*:${APP_PORT}->"; do
    APP_PORT=$((APP_PORT+1))
  done
fi
printf 'APP_PORT=%s\n' "$APP_PORT" > .env
echo "    using 127.0.0.1:${APP_PORT}"

echo "==> [3b/6] Build & start containers"
docker compose up -d --build --remove-orphans

echo "==> [4/6] Wait for app on 127.0.0.1:${APP_PORT}"
for i in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${APP_PORT}/"; then echo "    app is up"; break; fi
  sleep 2
  if [ "$i" -eq 60 ]; then echo "    app did not start in time"; docker compose logs --tail=50 web; exit 1; fi
done

echo "==> [5/6] Nginx"
# Only our own vhost is touched; other sites in sites-enabled/ (incl. "default") are left as they are.
sed "s#proxy_pass http://127.0.0.1:3000;#proxy_pass http://127.0.0.1:${APP_PORT};#" \
  "$APP_DIR/deploy/nginx/housecarewiki.com.conf" > "/etc/nginx/sites-available/${DOMAIN}.conf"
ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
nginx -t
systemctl enable --now nginx >/dev/null 2>&1 || true
systemctl reload nginx

echo "==> [6/6] TLS certificate (Let's Encrypt)"
certbot --nginx --non-interactive --agree-tos --redirect --keep-until-expiring -m "$LE_EMAIL" -d "$DOMAIN" -d "www.${DOMAIN}" \
  || echo "    certbot failed — check certbot logs"
systemctl reload nginx

echo
echo "==> Done. Containers:"
docker compose ps
echo
echo "Site: https://${DOMAIN}"
