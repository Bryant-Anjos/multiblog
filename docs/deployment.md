# Deployment

How the multiBlog install is deployed to a Hostinger VPS, reusing the CI/CD
pattern first built for the eis-aqui project.

## Topology

One VPS serves the multiblog installation. Every blog is a `Site` in a single
PostgreSQL database, resolved by its own hostname. A single reverse proxy
(nginx) owns ports 80/443 and fronts one application stack:

```
              *.briam.cloud (Cloudflare proxy, terminates TLS for visitors)
                                   │
                       nginx edge (docker-compose.edge.yml)
                     TCP 80/443, one vhost per blog hostname
                       /api/*  →  api:8080
                       everything else → web:3000
                                   │
  Docker network `multiblog-edge` (external)
                                   │
        ┌──────────────────────────┼──────────────────────────┐
   docker-compose.app.yml                                       
   Postgres :5432      api :8080   (Dockerfile.api)     web :3000 (Dockerfile.web)
```

- **Edge** (`docker-compose.edge.yml`): the only thing with published ports.
  Renders one vhost per blog from a single `nginx/site.conf.template`.
- **App** (`docker-compose.app.yml`): Postgres + API + web, **no** published
  ports, joined to the edge network so the proxy can reach them.
- **Cloudflare** terminates TLS for visitors; the origin presents a single
  Cloudflare **origin certificate** for `briam.cloud` and `*.briam.cloud`.

### What the requests resolve

The web app and the API both read the incoming `Host` to pick the blog:

- The web (`apps/web/src/lib/api.ts` `getHost`) sends `X-Site-Host: <host>` to
  the API.
- The API (`apps/api/internal/handlers/public.go` `ResolveSite`) looks up the
  `Site` by that hostname and 404s if none matches.
- nginx sets `proxy_set_header Host $host`, so the browser's `Host` (the blog
  subdomain) flows straight through. Each vhost has its own `server_name`, so
  the correct hostname reaches the app for every blog.

## What lives where (repo vs VPS)

In the repo, everything needed to build and deploy:

| File | Purpose |
| --- | --- |
| `Dockerfile.api`, `Dockerfile.web` | Built by CI at the repo root, pushed to GHCR |
| `docker-compose.app.yml` | App stack definition (no secrets inside) |
| `docker-compose.edge.yml` | Edge proxy definition |
| `nginx/` | `http.conf.template`, `site.conf.template`, `tls.conf`, `cloudflare-ips.conf` |
| `scripts/` | `deploy-app.sh`, `deploy-edge.sh`, `render-nginx-sites.sh`, `install-origin-cert.sh`, `init-letsencrypt.sh` |
| `.github/workflows/` | `ci.yml` (verify), `deploy.yml` (build + push + deploy) |

On the VPS, in `/opt/multiblog` (and `/opt/multiblog/edge`), direct from the
repo but **not** committed sources:

| Path | Holds |
| --- | --- |
| `/opt/multiblog/.env` | App secrets (+ `POSTGRES_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`) |
| `/opt/multiblog/.deployed-tag` | The image tag last applied (written by `deploy-app.sh`) |
| `/opt/multiblog/edge/.env` | Edge config: `SITES`, `CERTBOT_EMAIL` |
| `/opt/multiblog/edge/certbot-data` | Certificates (origin cert by default) — never overwritten by a deploy |

The deploy workflow ships the **files** over SSH every run (`tar` over ssh) but
the `.env` and `certbot-data` are never in the payload, so a deploy cannot
overwrite secrets or certificates.

## Cloudflare setup (recommended)

The regular, recommended TLS path uses Cloudflare's proxy. You do **not** need
a certificate per blog subdomain: a single **wildcard origin certificate**
covers `*.briam.cloud`.

1. **Put `briam.cloud` on Cloudflare.** In the Cloudflare dashboard: *Add a
   site* → enter `briam.cloud` → Free plan. Cloudflare scans the zone's
   existing DNS records. Then, in Hostinger hPanel (Domains → Nameservers),
   replace Hostinger's nameservers with the two Cloudflare ones Cloudflare
   shows you. (If DNSSEC is enabled, disable it at Hostinger **first**, change
   nameservers, and re-enable DNSSEC through Cloudflare.) This is required:
   origins behind Cloudflare's proxy meaningfully need Cloudflare to be the
   DNS authority. Keeping the domain *registered* with Hostinger is fine — the
   registrar and DNS provider do not have to be the same.

2. **Issue a wildcard origin certificate.** Cloudflare dashboard → SSL/TLS →
   Origin Server → Create Certificate. Hostnames:
   ```
   briam.cloud, *.briam.cloud
   ```
   Save the certificate and key into two files (e.g. `/tmp/origin.pem`,
   `/tmp/origin-key.pem`), then on the host from `/opt/multiblog/edge`:
   ```bash
   ./install-origin-cert.sh /tmp/origin.pem /tmp/origin-key.pem
   ```

3. **Set SSL mode to Full (strict).** Cloudflare → SSL/TLS → Overview →
   **Full (strict)**. Anything less lets Cloudflare accept any origin
   certificate, defeating the encryption this gives you.

4. **Proxy the blog records.** In Cloudflare → DNS, create the records you
   want to be blogs, as `A` (or `CNAME` to your VPS IP) with the **orange
   (proxied)** cloud, e.g. `multiblog.briam.cloud`, `blog-01.briam.cloud` … If
   you want **any** future subdomain to work without a new record, a wildcard
   `*` `A` record also proxied works — but then every unknown subdomain hits
   the edge, whose `default_server` refuses it (`444`).

5. **Start the edge.** `docker compose -f docker-compose.edge.yml up -d`.

The origin certificate lasts **15 years** — there is no renewal loop.

### Without Cloudflare (the "way back")

If the Cloudflare proxy is ever switched off, run `scripts/init-letsencrypt.sh`
to issue real Let's Encrypt certificates into the same directory. It will use
HTTP-01 (webroot), so **each blog subdomain gets its own certificate**. To use
a single `*.briam.cloud` wildcard instead, you would need a DNS-01 plugin,
which this script does not drive. nginx resolves whichever is there, so the
templates never change.

## GitHub settings

The deploy workflow reads these from the `production` environment and repo:

Secrets:

| Secret | Value |
| --- | --- |
| `SSH_PRIVATE_KEY` | Private half of the deploy SSH key pair |
| `SSH_KNOWN_HOSTS` | The VPS's host key, so the session is pinned |

Variables:

| Var | Value |
| --- | --- |
| `SSH_HOST` | VPS public IP / hostname |
| `SSH_USER` | SSH user on the VPS (e.g. `root`) |
| `SITE_DOMAIN` | One blog hostname to smoke-test, e.g. `blog-01.briam.cloud` |

## First-time host setup (once, by hand)

1. Provision a Hostinger VPS with Docker and Compose installed.
2. Create the directories and the two `.env` files:
   ```bash
   mkdir -p /opt/multiblog/edge
   ```
   `/opt/multiblog/.env`:
   ```env
   POSTGRES_PASSWORD=<random>
   DATABASE_URL=postgres://multiblog:<that-password>@db:5432/multiblog?sslmode=disable
   JWT_SECRET=<random>
   ADMIN_PASSWORD=<a strong admin password>
   # IMAGE_REPO defaults to ghcr.io/bryant-anjos/multiblog; set only if different
   ```
   `/opt/multiblog/edge/.env`:
   ```env
   # One entry per blog: id:domain:api_host:web_host
   # Every blog shares the api/web containers, so those are always `api`/`web`.
   SITES="multiblog:multiblog.briam.cloud:api:web
          blog-01:blog-01.briam.cloud:api:web"
   CERTBOT_EMAIL=you@example.com
   ```
3. Install the origin certificate (see above) **before** the first `up` (nginx
   will not boot with `listen 443 ssl` pointing at a missing certificate).
4. Create the shared network and start the edge:
   ```bash
   docker network create multiblog-edge
   cd /opt/multiblog/edge && docker compose -f docker-compose.edge.yml up -d
   ```
5. First deploy can then be done by the workflow (push to `production`) or
   manually: `./scripts/deploy-app.sh production-<sha>`.

### Adding a blog

A blog is just a `Site` in the database bound to a hostname. Steps:

1. Ensure DNS points that hostname at the VPS (a proxied record on Cloudflare,
   or covered by the wildcard).
2. Add it to `SITES` in `/opt/multiblog/edge/.env` (and re-`deploy-edge.sh`).
3. Create the `Site` in the multiblog admin UI and bind that hostname to it
   (Settings → Domains → Add). The hostname must exactly match the `SITES`
   domain field (`ResolveSite` matches on the verbatim hostname).
4. The vhost entry and the DB `Domain` both have to exist, in this order of
   authorship but either deploy order: nginx refuses a vhost whose certificate
   is missing, and a request for a hostname with no `Site` 404s.

## Developing / rehearsing locally

The `docker-compose.yml` at the repo root is the dev stack (published ports,
built from source, `admin123`). The production stack is only ever exercised
through `deploy-app.sh`/`deploy-edge.sh` on the host or their workflow
equivalents; there is no local "prod-like" compose for multiblog yet.