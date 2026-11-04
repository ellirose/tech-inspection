#!/usr/bin/env bash
# Sets up a fresh Ubuntu 24.04 server for Tech-Inspection: Node.js 24, PostgreSQL 16, Nginx, certbot,
# firewall, the app user, the database, settings, the `ti` command and its timers. Safe to run again:
# existing settings, database and releases are kept. Run as root from a copy of this folder:
#   scp -r deploy root@SERVER:/root/ti-deploy && ssh root@SERVER bash /root/ti-deploy/provision.sh [HOST]
# HOST is the name the site answers to (default: <ip>.sslip.io until the real domain points here).
# Then: ti deploy --force, and ti domain HOST for HTTPS.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=/srv/tech-inspection
ENV_FILE=$ROOT/shared/.env
export DEBIAN_FRONTEND=noninteractive

IP=$(curl -fsS -m 5 http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address 2>/dev/null || hostname -I | awk '{print $1}')
HOST=${1:-$(echo "$IP" | tr . -).sslip.io}
echo "== host $HOST"

echo "== swap (next build needs more than 4 GB of RAM at peak)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap -q /swapfile && swapon /swapfile
  grep -q /swapfile /etc/fstab || echo '/swapfile none swap sw 0 0' >>/etc/fstab
  echo 'vm.swappiness=10' >/etc/sysctl.d/99-swap.conf && sysctl -q -p /etc/sysctl.d/99-swap.conf
fi

echo "== packages"
apt-get update -q
apt-get install -yq ca-certificates curl gnupg jq git nginx postgresql postgresql-contrib certbot python3-certbot-nginx fail2ban ufw >/dev/null
if ! node -v 2>/dev/null | grep -q '^v24\.'; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash - >/dev/null
  apt-get install -yq nodejs >/dev/null
fi
echo "node $(node -v), npm $(npm -v), $(psql --version), $(nginx -v 2>&1)"

echo "== firewall: SSH, HTTP and HTTPS only (PostgreSQL stays on localhost)"
ufw allow OpenSSH >/dev/null && ufw allow 'Nginx Full' >/dev/null && ufw --force enable >/dev/null
systemctl enable --now fail2ban >/dev/null 2>&1

echo "== app user and folders"
id app >/dev/null 2>&1 || useradd --system --home-dir "$ROOT" --shell /usr/sbin/nologin app
mkdir -p "$ROOT"/releases "$ROOT"/shared/data/uploads "$ROOT"/shared/data/outbox "$ROOT"/shared/backups
chown -R app:app "$ROOT" && chmod 750 "$ROOT"

echo "== database"
DB_PASSWORD=""
if ! runuser -u postgres -- psql -tAc "select 1 from pg_roles where rolname = 'techinspection'" | grep -q 1; then
  DB_PASSWORD=$(openssl rand -hex 24)
  runuser -u postgres -- psql -q -c "create role techinspection login password '$DB_PASSWORD'"
fi
if ! runuser -u postgres -- psql -tAc "select 1 from pg_database where datname = 'techinspection'" | grep -q 1; then
  runuser -u postgres -- createdb -O techinspection -E UTF8 -T template0 --locale=C.UTF-8 techinspection
fi

echo "== settings ($ENV_FILE)"
if [ ! -f "$ENV_FILE" ]; then
  [ -n "$DB_PASSWORD" ] || { echo "the database role exists but $ENV_FILE does not: set DATABASE_URL by hand" >&2; exit 1; }
  cat >"$ENV_FILE" <<EOF
# Tech-Inspection settings, read by the app and by every build. Change with: ti set KEY=VALUE
# (see .env.example in the repository for what each one does).
DATABASE_URL="postgres://techinspection:$DB_PASSWORD@127.0.0.1:5432/techinspection"
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_URL="http://$HOST"
NEXT_PUBLIC_SITE_URL="http://$HOST"
EMAIL_FROM="Tech-Inspection <notificaciones@send.tech-inspection.com>"
# Without RESEND_API_KEY, emails are written here instead of sent.
EMAIL_OUTBOX_DIR="$ROOT/shared/data/outbox"
# Cloudflare's test keys (always pass) until the real ones are set.
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
NEXT_TELEMETRY_DISABLED="1"
EOF
  touch "$ROOT/shared/deploy.log"
fi
chown app:app "$ENV_FILE" "$ROOT/shared/deploy.log" 2>/dev/null || true
chmod 600 "$ENV_FILE"

echo "== source code (public repository, read over HTTPS)"
[ -d "$ROOT/repo/.git" ] || runuser -u app -- git clone --quiet --branch main https://github.com/ellirose/tech-inspection.git "$ROOT/repo"

echo "== ti command, services and timers"
install -m 755 "$HERE/ti" /usr/local/bin/ti
install -m 644 "$HERE"/tech-inspection.service "$HERE"/ti-*.service "$HERE"/ti-*.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable tech-inspection >/dev/null 2>&1
systemctl enable --now ti-backup.timer >/dev/null 2>&1

echo "== nginx"
if [ ! -f /etc/nginx/sites-available/tech-inspection ]; then
  sed -e "s/__HOST__/$HOST/g" -e "s/__SCHEME__/http/g" "$HERE/nginx.conf" >/etc/nginx/sites-available/tech-inspection
fi
ln -sfn /etc/nginx/sites-available/tech-inspection /etc/nginx/sites-enabled/tech-inspection
rm -f /etc/nginx/sites-enabled/default
nginx -t -q && systemctl reload nginx

echo "== done. Next: ti deploy --force; ti domain $HOST; systemctl enable --now ti-autodeploy.timer"
