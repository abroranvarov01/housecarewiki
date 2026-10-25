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
# Brotli compression module (Ubuntu universe). Optional: the vhost works without it.
apt-get install -y -qq libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static >/dev/null 2>&1 \
  || echo "    brotli module not available, gzip only"

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
# Update APP_PORT in .env without wiping other settings (e.g. ADMIN_PASSWORD).
touch .env && chmod 600 .env
grep -v '^APP_PORT=' .env > .env.tmp || true
printf 'APP_PORT=%s\n' "$APP_PORT" >> .env.tmp && mv .env.tmp .env
echo "    using 127.0.0.1:${APP_PORT}"
if ! grep -q '^ADMIN_PASSWORD=.' .env; then
  ADMIN_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)"
  printf 'ADMIN_PASSWORD=%s\n' "$ADMIN_PASSWORD" >> .env
  echo "    generated admin login: admin / ${ADMIN_PASSWORD}  (stored in ${APP_DIR}/.env)"
fi

echo "==> [3b/6] Build & start containers"
docker compose up -d --build --remove-orphans

echo "==> [4/6] Wait for app on 127.0.0.1:${APP_PORT}"
for i in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${APP_PORT}/"; then echo "    app is up"; break; fi
  sleep 2
  if [ "$i" -eq 60 ]; then echo "    app did not start in time"; docker compose logs --tail=50 web; exit 1; fi
done

echo "==> [5/6] TLS certificate (Let's Encrypt, webroot)"
mkdir -p /var/www/certbot
CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
if [ ! -f "$CERT" ]; then
  # Bootstrap: plain-HTTP vhost that only answers ACME challenges, so certbot can issue the first cert.
  cat > "/etc/nginx/sites-available/${DOMAIN}.conf" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    location ^~ /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { proxy_pass http://127.0.0.1:${APP_PORT}; proxy_set_header Host \$host; }
}
NGINX
  ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
  nginx -t && systemctl enable --now nginx >/dev/null 2>&1 || true
  systemctl reload nginx
  certbot certonly --webroot -w /var/www/certbot --non-interactive --agree-tos --keep-until-expiring \
    -m "$LE_EMAIL" -d "$DOMAIN" -d "www.${DOMAIN}"
fi
# Renewals reuse the webroot and only need nginx reloaded afterwards.
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo "==> [6/6] Nginx (HTTPS, 301 redirects, gzip/brotli, HTTP/2, static cache)"
# Brotli snippet: real directives only when the module is loaded, otherwise an empty file.
mkdir -p /etc/nginx/snippets /var/cache/nginx/housecarewiki
if ls /etc/nginx/modules-enabled/ 2>/dev/null | grep -q brotli; then
  cat > /etc/nginx/snippets/housecarewiki-brotli.conf <<'NGINX'
brotli on;
brotli_comp_level 5;
brotli_min_length 1024;
brotli_types text/plain text/css text/xml text/javascript text/markdown application/xml application/json
             application/ld+json application/javascript application/rss+xml application/atom+xml
             application/manifest+json image/svg+xml font/ttf font/otf;
NGINX
else
  : > /etc/nginx/snippets/housecarewiki-brotli.conf
fi

# Requests to the bare IP over HTTPS (or an unknown Host) must not serve a copy of the site.
# Added only when no other site already claims the 443 default_server.
if ! grep -rqsE 'listen[^;]*443[^;]*default_server' /etc/nginx/sites-enabled/ /etc/nginx/conf.d/; then
  cat > /etc/nginx/sites-available/00-reject-unknown-https.conf <<'NGINX'
server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name _;
    ssl_reject_handshake on;
}
NGINX
  ln -sf /etc/nginx/sites-available/00-reject-unknown-https.conf /etc/nginx/sites-enabled/00-reject-unknown-https.conf
fi

# Only our own vhost is touched; other sites in sites-enabled/ (incl. "default") are left as they are.
sed "s#server 127.0.0.1:3000;#server 127.0.0.1:${APP_PORT};#" \
  "$APP_DIR/deploy/nginx/housecarewiki.com.conf" > "/etc/nginx/sites-available/${DOMAIN}.conf"
ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
nginx -t
# Images are not content-hashed, so drop cached copies from the previous release.
find /var/cache/nginx/housecarewiki -mindepth 1 -delete 2>/dev/null || true
systemctl enable --now nginx >/dev/null 2>&1 || true
systemctl reload nginx

echo
echo "==> Done. Containers:"
docker compose ps
echo
echo "Site: https://${DOMAIN}"
