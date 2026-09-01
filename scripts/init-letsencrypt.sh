#!/usr/bin/env bash
# One-time TLS bootstrap for the edge proxy when the blog domains are NOT
# proxied by Cloudflare.
#
# nginx refuses to start with `listen 443 ssl` unless a certificate already
# exists at the path it references, but Let's Encrypt's HTTP-01 challenge
# needs nginx running to *issue* that certificate — the standard resolution
# (wmnnd/nginx-certbot pattern): start nginx with throwaway self-signed
# certificates just so it can boot, request the real ones through it, then
# reload nginx onto them.
#
# ── This is the WAY BACK, not the normal path ──────────────────────────────
#
# With the domains proxied by Cloudflare, the normal TLS path is a Cloudflare
# ORIGIN certificate installed by scripts/install-origin-cert.sh (15 years,
# no renewal, no challenge to pass). This script is what you run if the
# Cloudflare proxy is ever switched off: it repopulates the same
# certbot-data/conf directory with publicly-trusted certificates and nothing
# else in the stack changes. That is also why the `certbot` service it drives
# sits behind a compose profile — it does not run otherwise.
#
# It works over the whole SITES list and treats each domain independently — a
# domain that already has a real certificate is left alone, which is what
# makes it safe to re-run whenever a blog is added.
#
# Each blog subdomain is issued its OWN certificate here (there is no Let's
# Encrypt wildcard without a DNS-01 challenge). If you want a single wildcard
# *.briam.cloud instead, issue it with a DNS-01 plugin — this script uses the
# webroot method, which needs a resolvable HTTP subdomain per vhost.
#
# Usage (on the host, from /opt/multiblog/edge, after its `.env` exists):
#   ./init-letsencrypt.sh                 # every domain in SITES
#   ./init-letsencrypt.sh blog-01.briam.cloud    # just this one
set -euo pipefail

cd "$(dirname "$0")"

[ -f .env ] || { echo "init-letsencrypt: .env is missing here — see docs/deployment.md" >&2; exit 1; }
set -a; . ./.env; set +a

: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in .env (the address the CA sends expiry notices to)}"
: "${SITES:?Set SITES in .env (id:domain:api_host:web_host ...)}"

COMPOSE="docker compose -f docker-compose.edge.yml --profile letsencrypt"
DATA_PATH="./certbot-data"
RSA_KEY_SIZE=4096

if [ "$#" -gt 0 ]; then
  DOMAINS=("$@")
else
  # Field 2 of every SITES entry.
  read -r -a DOMAINS <<< "$(for s in $SITES; do echo -n "$(echo "$s" | cut -d: -f2) "; done)"
fi

echo "### Domains: ${DOMAINS[*]}"

mkdir -p "$DATA_PATH/conf" "$DATA_PATH/www"

existing=$($COMPOSE run --rm --entrypoint certbot certbot certificates 2>/dev/null || true)

pending=()
for domain in "${DOMAINS[@]}"; do
  if echo "$existing" | grep -q "Domains: ${domain}$"; then
    echo "### ${domain}: real certificate already present — leaving it alone."
  else
    pending+=("$domain")
  fi
done

if [ ${#pending[@]} -eq 0 ]; then
  echo "### Nothing to issue. Starting the edge as-is."
  $COMPOSE up -d
  exit 0
fi

echo "### Creating dummy certificates for: ${pending[*]}"
for domain in "${pending[@]}"; do
  docker run --rm -v "$(pwd)/$DATA_PATH/conf:/etc/letsencrypt" certbot/certbot \
    sh -c "mkdir -p '/etc/letsencrypt/live/${domain}' && openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1 \
      -keyout '/etc/letsencrypt/live/${domain}/privkey.pem' \
      -out '/etc/letsencrypt/live/${domain}/fullchain.pem' \
      -subj '/CN=localhost'"
done

echo "### Starting nginx on the dummy certificates ..."
$COMPOSE up -d nginx

for domain in "${pending[@]}"; do
  echo "### ${domain}: deleting the dummy certificate ..."
  docker run --rm -v "$(pwd)/$DATA_PATH/conf:/etc/letsencrypt" busybox \
    sh -c "rm -rf /etc/letsencrypt/live/${domain} /etc/letsencrypt/archive/${domain} /etc/letsencrypt/renewal/${domain}.conf"

  echo "### ${domain}: requesting the real Let's Encrypt certificate ..."
  $COMPOSE run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
      --email ${CERTBOT_EMAIL} -d ${domain} \
      --rsa-key-size $RSA_KEY_SIZE --agree-tos --no-eff-email" certbot
done

echo "### Reloading nginx onto the real certificates ..."
$COMPOSE exec nginx nginx -s reload

echo "### Starting the rest of the edge (certbot renewal loop) ..."
$COMPOSE up -d

echo "Done. ${DOMAINS[*]} now serve real HTTPS."