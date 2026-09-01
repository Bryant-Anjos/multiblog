#!/usr/bin/env bash
# Installs a Cloudflare Origin Certificate for every domain in SITES.
#
#   ./install-origin-cert.sh <certificate.pem> <private-key.pem>
#
# Run once, on the host, from /opt/multiblog/edge — before the first
# `docker compose -f docker-compose.edge.yml up`, because nginx will not start
# with `listen 443 ssl` pointing at a certificate file that does not exist.
#
# ── Where the two files come from ──────────────────────────────────────────
#
# Cloudflare dashboard → SSL/TLS → Origin Server → Create Certificate. Accept
# the defaults, but make the hostname list cover everything this host serves.
# With the blog subdomains you want a single WILDCARD certificate:
#
#     briam.cloud, *.briam.cloud
#
# The wildcard is what makes ONE certificate serve every blog subdomain
# (blog-01.briam.cloud, blog-02.briam.cloud, the multiblog install itself,
# …) and any future subdomain — you never need a certificate per subdomain
# while the domains are proxied by Cloudflare. Cloudflare shows the
# certificate and the key exactly once — save both, then point this script at
# the two files.
#
# Then set SSL/TLS → Overview → **Full (strict)**. Anything less and
# Cloudflare will happily talk to an origin presenting any certificate at all,
# which gives up the half of the encryption that this file exists to provide.
#
# ── What it is, and what it is not ─────────────────────────────────────────
#
# An origin certificate is trusted by CLOUDFLARE ONLY — no browser will accept
# it. That is not a limitation here: with the domains proxied by Cloudflare the
# only client that ever completes a TLS handshake with this host is Cloudflare,
# and visitors get Cloudflare's own publicly-trusted certificate. It also means
# this host is NOT directly usable over HTTPS by a browser, which is why
# testing must go through the domains, never the raw IP.
#
# It lasts 15 years and has no renewal mechanism — deliberately the opposite
# trade from Let's Encrypt: nothing to automate, one thing to remember. The
# expiry date is printed at the end; put it somewhere.
set -euo pipefail

cd "$(dirname "$0")/.."

CERT="${1:?usage: install-origin-cert.sh <certificate.pem> <private-key.pem>}"
KEY="${2:?usage: install-origin-cert.sh <certificate.pem> <private-key.pem>}"

[ -f .env ] || { echo "install-origin-cert: no .env here — run this from /opt/multiblog/edge" >&2; exit 1; }
set -a; . ./.env; set +a
: "${SITES:?SITES is required in .env}"

[ -s "$CERT" ] || { echo "install-origin-cert: $CERT is empty or missing" >&2; exit 1; }
[ -s "$KEY" ]  || { echo "install-origin-cert: $KEY is empty or missing" >&2; exit 1; }

# Catch the two ways this goes wrong silently: a truncated paste, or the cert
# and the key swapped (which nginx reports much later, as a startup failure).
openssl x509 -in "$CERT" -noout >/dev/null 2>&1 || { echo "install-origin-cert: $CERT is not a certificate" >&2; exit 1; }
openssl pkey -in "$KEY" -noout >/dev/null 2>&1  || { echo "install-origin-cert: $KEY is not a private key" >&2; exit 1; }

cert_mod=$(openssl x509 -in "$CERT" -noout -pubkey | openssl pkey -pubin -outform DER 2>/dev/null | sha256sum)
key_mod=$(openssl pkey -in "$KEY" -pubout -outform DER 2>/dev/null | sha256sum)
[ "$cert_mod" = "$key_mod" ] || { echo "install-origin-cert: this key does not belong to this certificate" >&2; exit 1; }

for site in $SITES; do
  domain=$(echo "$site" | cut -d: -f2)

  # certbot's own layout, so the nginx templates do not care which mechanism
  # produced the files. The same pair is copied per domain rather than
  # symlinked: it costs two files and makes replacing ONE domain's certificate
  # later a local change.
  dir="certbot-data/conf/live/$domain"
  mkdir -p "$dir"
  install -m 644 "$CERT" "$dir/fullchain.pem"
  install -m 600 "$KEY"  "$dir/privkey.pem"
  echo "installed for $domain"
done

mkdir -p certbot-data/www

echo
echo "Certificate covers: $(openssl x509 -in "$CERT" -noout -text | grep -A1 'Subject Alternative Name' | tail -1 | sed 's/^ *//')"
echo "Expires:            $(openssl x509 -in "$CERT" -noout -enddate | cut -d= -f2)"
echo
echo "Now: Cloudflare → SSL/TLS → Overview → Full (strict), then"
echo "     docker compose -f docker-compose.edge.yml up -d"