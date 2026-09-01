#!/usr/bin/env bash
# Applies the shared edge proxy's configuration on the VPS.
#
#   ./deploy-edge.sh
#
# ── Why this is riskier than deploy-app.sh, and what protects it ────────────
#
# The edge is the single nginx in front of every blog, so a broken nginx
# configuration takes every blog down at once. The new configuration is
# therefore validated in a THROWAWAY container before the real one is touched.
# `compose run` reuses the service's own env and volumes, so the entrypoint
# renders the templates for every blog in SITES and `nginx -t` parses the
# result — including the certificate paths, which is what catches the likeliest
# mistake by far: a blog added to SITES whose certificate was never issued.
#
# If validation fails, nothing is recreated and the edge keeps serving with
# the configuration it already has.
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/multiblog}"
cd "$DEPLOY_ROOT/edge"

[ -f .env ] || { echo "deploy-edge: $PWD/.env is missing — see docs/deployment.md" >&2; exit 1; }

# The edge network this stack joins is external to both compose projects, and
# on a brand-new host nothing has created it yet — the app stack would, but the
# edge may come up first. Idempotent, so this is a no-op from the second
# deploy on.
docker network inspect multiblog-edge >/dev/null 2>&1 || docker network create multiblog-edge

echo "==> validating the rendered nginx configuration"
if ! docker compose -f docker-compose.edge.yml run --rm --no-deps nginx nginx -t; then
  echo "deploy-edge: nginx rejected the new configuration — the running edge was NOT touched" >&2
  exit 1
fi

# `--force-recreate`, and it is not belt-and-braces: `docker compose up -d`
# compares the SERVICE DEFINITION, not the content of the files it mounts, so
# a changed nginx template leaves the running container exactly as it was and
# the deploy reports success having applied nothing.
#
# The SSR cache is not a concern here (multiblog sets no nginx proxy cache),
# so this is a clean recreation of nginx.
echo "==> applying"
docker compose -f docker-compose.edge.yml up -d --force-recreate

echo "==> edge is up"