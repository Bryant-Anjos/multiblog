CREATE TABLE IF NOT EXISTS admin_user (
    id            UUID PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sites (
    id          UUID PRIMARY KEY,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS domains (
    id         UUID PRIMARY KEY,
    site_id    UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    hostname   TEXT NOT NULL UNIQUE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id           UUID PRIMARY KEY,
    site_id      UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    slug         TEXT NOT NULL,
    content      TEXT NOT NULL DEFAULT '',
    excerpt      TEXT NOT NULL DEFAULT '',
    status       TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (site_id, slug)
);

CREATE TABLE IF NOT EXISTS pages (
    id         UUID PRIMARY KEY,
    site_id    UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    slug       TEXT NOT NULL,
    content    TEXT NOT NULL DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (site_id, slug)
);

CREATE TABLE IF NOT EXISTS stories (
    id                UUID PRIMARY KEY,
    site_id           UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    slug              TEXT NOT NULL,
    description       TEXT NOT NULL DEFAULT '',
    parent_story_id   UUID REFERENCES stories(id) ON DELETE CASCADE,
    relationship_type TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (site_id, slug)
);

CREATE TABLE IF NOT EXISTS story_groups (
    id         UUID PRIMARY KEY,
    story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    slug       TEXT NOT NULL,
    position   INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (story_id, slug)
);

CREATE TABLE IF NOT EXISTS chapters (
    id           UUID PRIMARY KEY,
    story_id     UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    group_id     UUID REFERENCES story_groups(id) ON DELETE SET NULL,
    title        TEXT NOT NULL,
    slug         TEXT NOT NULL,
    content      TEXT NOT NULL DEFAULT '',
    position     INTEGER NOT NULL DEFAULT 0,
    status       TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (story_id, slug)
);

CREATE TABLE IF NOT EXISTS navigation_items (
    id          UUID PRIMARY KEY,
    site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    label       TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'page',
    destination TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    is_visible  BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domains_hostname ON domains (hostname);
CREATE INDEX IF NOT EXISTS idx_posts_site ON posts (site_id);
CREATE INDEX IF NOT EXISTS idx_posts_site_status ON posts (site_id, status);
CREATE INDEX IF NOT EXISTS idx_pages_site ON pages (site_id);
CREATE INDEX IF NOT EXISTS idx_stories_site ON stories (site_id);
CREATE INDEX IF NOT EXISTS idx_story_groups_story ON story_groups (story_id);
CREATE INDEX IF NOT EXISTS idx_chapters_story ON chapters (story_id);
CREATE INDEX IF NOT EXISTS idx_navigation_site ON navigation_items (site_id);
