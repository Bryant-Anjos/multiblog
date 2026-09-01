#!/usr/bin/env bash
# Deploys the multiBlog application stack on the VPS.
#
# Runs on the host, invoked over SSH by .github/workflows/deploy.yml — and by
# hand, with the same arguments, when something needs to be reapplied without
# a workflow. It is deliberately the only place that knows the deploy
# sequence, so a manual deploy and an automated one cannot diverge.
#
#   ./deploy-app.sh <image-tag>
#   ./deploy-app.sh production-8f3c1a2
#
# Rolling back is this same command with the previous tag — the images stay
# in GHCR, so nothing is rebuilt. The tag last applied is recorded in
# `.deployed-tag` in this directory.
set -euo pipefail

IMAGE_TAG="${1:?usage: deploy-app.sh <image-tag>}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/multiblog}"
DIR="${DIR:-$DEPLOY_ROOT}"
NETWORK="multiblog-edge"

cd "$DIR"

# The environment's own `.env` is created once, by hand, and never touched by
# a deploy — it holds every secret. Its absence means the host was never
# bootstrapped (docs/deployment.md → "First-time host setup"), which is worth
# saying plainly rather than letting compose fail on an unset variable.
[ -f .env ] || { echo "deploy-app: $DIR/.env is missing — see docs/deployment.md" >&2; exit 1; }

# The edge network is external to both compose projects (neither may own
# something the other depends on), so somebody has to create it. Idempotent:
# this is a no-op on every deploy after the first.
docker network inspect "$NETWORK" >/dev/null 2>&1 || docker network create "$NETWORK"

export IMAGE_TAG

echo "==> pulling $IMAGE_TAG"
IMAGE_REPO="${IMAGE_REPO:-ghcr.io/bryant-anjos/multiblog}" docker compose -f docker-compose.app.yml pull --quiet

echo "==> starting"
docker compose -f docker-compose.app.yml up -d --remove-orphans

# Wait for the API to be HEALTHY, not merely started. `Dockerfile.api`'s
# healthcheck hits /health, which checks the database and answers 503 when it
# is unreachable — so this also covers "migrations ran and the process can
# actually serve" (they run at startup). A deploy that leaves a dead API must
# fail loudly here rather than reporting success.
echo "==> waiting for the API to become healthy"
api_cid=$(docker compose -f docker-compose.app.yml ps -q api)
for _ in $(seq 1 60); do
  status=$(docker inspect --format '{{.State.Health.Status}}' "$api_cid" 2>/dev/null || echo unknown)
  case "$status" in
    healthy) break ;;
    unhealthy)
      echo "deploy-app: the API reported unhealthy" >&2
      docker compose -f docker-compose.app.yml logs --tail 50 api >&2
      exit 1 ;;
  esac
  sleep 5
done
[ "${status:-}" = healthy ] || {
  echo "deploy-app: the API did not become healthy within 5 minutes (last status: ${status:-unknown})" >&2
  docker compose -f docker-compose.app.yml logs --tail 50 api >&2
  exit 1
}

echo "$IMAGE_TAG" > .deployed-tag

# Only dangling layers, never `-a`: the previous tag has to stay pullable
# locally for a rollback that does not depend on the network.
docker image prune -f >/dev/null

echo "==> production is running $IMAGE_TAG"