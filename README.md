# MultiBlog — Personal Publishing Platform

A multi-site blog engine. One installation runs any number of independent blogs,
each resolved by its own hostname (or local subdomain). Built as a monorepo with a
Go API and a Next.js frontend, following the spec in [`docs/project.md`](docs/project.md)
and the visual design in [`docs/ui-ux.md`](docs/ui-ux.md).

## Concepts

- **Site** — a self-contained blog ("My Blog", "The Chronicles", `meublog.com.br`, …).
  The root domain is not special; it is just another `Site`.
- **Domain** — a hostname bound to a site. Requests are resolved by hostname.
- **Post / Page** — published or draft content, scoped strictly to its site.
- **Story** — a serialized work made of ordered chapters, optionally grouped into
  books; supports spin-offs (`relationship_type`, `parent_story_id`).

Content is fully isolated: site A's posts/pages/stories can never be reached through
site B's hostname (404). This is enforced at both the repository and handler layers.

## Architecture

```
multiblog/
├── apps/
│   ├── api/          Go 1.22 — REST API + migrations + integration tests
│   │   ├── internal/
│   │   │   ├── config/        env config
│   │   │   ├── database/      migrate + connect
│   │   │   ├── models/        data models & request/response types
│   │   │   ├── repositories/  persistence (per-aggregate)
│   │   │   ├── handlers/      public + admin HTTP handlers
│   │   │   └── middleware/    auth (JWT) + hostname site resolution
│   │   ├── migrations/        `golang-migrate` SQL migrations + seed
│   │   └── integration_test.go
│   └── web/          Next.js 14 (App Router) — server-rendered public UI + admin
├── docs/             project.md, ui-ux.md
└── docker-compose.yml
```

### Stack

- **API**: Go + `gorilla/mux` + `lib/pq` + `golang-jwt` + `golang-migrate`, PostgreSQL 16
- **Web**: Next.js 14 App Router, React Server Components, `react-markdown` + `remark-gfm`
- **Database**: PostgreSQL 16 (volume-persisted)
- **Deploy**: Docker Compose (3 services)

### Public hostname resolution

Requests are resolved in this order:

1. Custom `X-Site-Host` header (used by the Next.js server-side fetches, because
   Node/undici forbids overriding the `Host` header).
2. The request `Host` header.

Service → (hostname) → matched `Domain` → its `Site`; unmatched hostnames 404.

## Running locally

```bash
docker compose up -d --build
```

| Service | URL / port |
| --- | --- |
| PostgreSQL | `localhost:5433` (exposed; `5432` is common-occupied) |
| API | `localhost:8080` (`/health`) |
| Web | `localhost:3000` |

Default seeded sites (see `migrations/000002_seed.up.sql`):

- **My Blog** → `localhost` and `meublog.com.br` (3 posts, an About page, no stories)
- **The Chronicles** → `diario.localhost` (1 story: 2 books / 3 chapters)

Add to `/etc/hosts` if you need the site B hostname from this machine:

```
127.0.0.1  diario.localhost
```

Admin login: `POST /api/admin/login` with the `ADMIN_PASSWORD` env value
(`admin123` in `docker-compose.yml`). The web admin UI is at `http://localhost:3000/admin`.

### Environment variables

- **api**: `DATABASE_URL`, `PORT`, `JWT_SECRET`, `CORS_ORIGIN`, `ADMIN_PASSWORD`
- **web**: `API_URL` (server-side, `http://api:8080`), `NEXT_PUBLIC_API_URL`
  (browser-side, `http://localhost:8080`)

## Running the Go tests

Integration tests run against a reachable multiblog database and clean up after
themselves. They cover site resolution by hostname/slug, content isolation,
publishing (draft → published), and story organization (groups, ordering, spin-offs).

```bash
# from apps/api, against the running stack's DB (host port 5433):
TEST_DATABASE_URL="postgres://multiblog:multiblog_dev@localhost:5433/multiblog?sslmode=disable" \
  docker run --rm --network=host \
  -e TEST_DATABASE_URL="postgres://multiblog:multiblog_dev@localhost:5433/multiblog?sslmode=disable" \
  -v "$PWD":/app -w /app \
  golang:1.22-alpine go test ./...
```

## Migrations

Migrations run automatically on API startup and are idempotent
(`golang-migrate`, `001_init.up.sql` schema, `002_seed.up.sql` sample data),
persisted in the `postgres_data` volume.

## Notes / decisions

- `X-Site-Host` is used instead of `Host` for frontend-originated lookup because
  Node (undici) rejects overriding `Host`.
- The host `5432` was already in use by an unrelated container, so postgres is
  published on `5433`.
- Empty collections serialize as `[]` (not `null`).
