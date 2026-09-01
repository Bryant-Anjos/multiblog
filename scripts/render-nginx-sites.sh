#!/bin/sh
# Renders one nginx vhost per BLOG from a single template.
#
# Mounted into the nginx image's /docker-entrypoint.d/ as
# `40-render-sites.sh`, so it runs at container start, AFTER the image's own
# `20-envsubst-on-templates.sh` (which renders nginx/http.conf.template, the
# `http`-level half) and BEFORE nginx itself starts. That ordering is the
# whole reason for the `40-` prefix.
#
# Why this exists. Multiblog serves independent blogs, each bound to its own
# hostname, all proxied by one nginx. Their vhosts are identical apart from
# the domain, and that config is load-bearing (TLS, the X-Forwarded-For
# overwrite, HSTS). Keeping N copies of it would guarantee they drift on the
# first edit, so there is one template and this loop.
#
# The nginx image's own envsubst pass cannot do this: it renders each
# template exactly once, with one set of values.
#
# ── Input ───────────────────────────────────────────────────────────────────
#
#   SITES  whitespace-separated entries, each `id:domain:api_host:web_host`
#          e.g. "blog-01:blog-01.briam.cloud:api:web
#                blog-02:blog-02.briam.cloud:api:web"
#
#          Every blog shares the same two containers, so `api_host`/`web_host`
#          are `api` and `web` for all of them (the compose aliases from
#          docker-compose.app.yml). The two fields are kept so this script is
#          identical to the eis-aqui project's and future-proof if a host ever
#          runs more than one multiblog stack.
set -eu

TEMPLATE=/etc/nginx/site.conf.template
CONF_DIR=/etc/nginx/conf.d
EXTRA_DIR=/etc/nginx/extra

: "${SITES:?SITES is required (id:domain:api_host:web_host ...) — see docker-compose.edge.yml}"

[ -f "$TEMPLATE" ] || { echo "render-nginx-sites: $TEMPLATE not mounted" >&2; exit 1; }
mkdir -p "$EXTRA_DIR"

# The image ships a `default.conf` serving its welcome page on port 80. Remove
# it so the first rendered site becomes the default server for unmatched
# requests (http.conf.template's default_server blocks also guard this).
rm -f "$CONF_DIR/default.conf"

for site in $SITES; do
  SITE_ID=$(echo "$site" | cut -d: -f1)
  DOMAIN=$(echo "$site" | cut -d: -f2)
  UPSTREAM_API=$(echo "$site" | cut -d: -f3)
  UPSTREAM_WEB=$(echo "$site" | cut -d: -f4)

  if [ -z "$SITE_ID" ] || [ -z "$DOMAIN" ] || [ -z "$UPSTREAM_API" ] || [ -z "$UPSTREAM_WEB" ]; then
    echo "render-nginx-sites: malformed SITES entry '$site' (want id:domain:api_host:web_host)" >&2
    exit 1
  fi

  export SITE_ID DOMAIN UPSTREAM_API UPSTREAM_WEB

  # An explicit variable list, unlike the image's own pass which substitutes
  # every env var it finds: nginx's own `$host`, `$scheme`, `$request_uri` …
  # are `$name` too, and a stray env var sharing one of those names would
  # quietly blank it out of the config.
  envsubst '${SITE_ID} ${DOMAIN} ${UPSTREAM_API} ${UPSTREAM_WEB}' \
    < "$TEMPLATE" > "$CONF_DIR/10-$SITE_ID.conf"

  # The per-site include the template always references. Empty for now — the
  # file has to exist either way, which keeps the template free of
  # conditionals. (eis-aqui uses this to add a noindex robots.txt override to
  # non-production sites; multiblog generates its own per-host robots.txt in
  # the web app, so nothing is written here by default.)
  : > "$EXTRA_DIR/$SITE_ID.conf"

  echo "render-nginx-sites: $SITE_ID -> $DOMAIN (api=$UPSTREAM_API web=$UPSTREAM_WEB)"
done