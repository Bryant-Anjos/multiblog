# Personal Publishing Platform — Implementation Prompt

You are responsible for implementing a personal publishing platform.

This is a real project intended for personal use, but it must be designed with good architecture, maintainability, extensibility, and production readiness.

Before writing code, carefully analyze the complete specification below and create an implementation plan. Then implement the project incrementally.

Do not overengineer features that are not required yet.

The primary objective is:

> Build one publishing platform capable of hosting multiple logically independent websites/blogs using the same application and infrastructure.

---

# 1. Project Concept

The platform allows one administrator to create and manage multiple independent publishing sites.

Examples:

```text
meublog.com.br
diario.meublog.com.br
historia-01.meublog.com.br
historia-02.meublog.com.br
```

Each of these must behave as an independent website.

Each site can have its own:

- Name
- Description
- Domains
- Theme/settings
- Navigation
- Posts
- Stories
- Pages
- Content

The root domain must **not be treated as a special application**.

For example:

```text
meublog.com.br
```

must simply be another `Site` in the system.

The system must determine which site is being accessed based on the request hostname.

Conceptually:

```text
Request
    │
    ▼
Hostname
    │
    ├── meublog.com.br
    │       └── Site A
    │
    ├── diario.meublog.com.br
    │       └── Site B
    │
    └── historia-01.meublog.com.br
            └── Site C
```

---

# 2. Core Architectural Principle

The central entity of the system is:

```text
Site
```

Everything belongs to a Site.

Conceptually:

```text
Site
│
├── Domains
├── Settings
├── Theme
├── Navigation
├── Posts
├── Stories
├── Pages
└── Other future content
```

All content must be isolated by `site_id`.

It must not be possible for content belonging to one Site to accidentally appear on another Site.

---

# 3. Technology Stack

## Frontend

Use:

- React
- TypeScript

Choose the most appropriate framework for a modern publishing website, considering:

- SEO
- Server-side rendering or static rendering
- Performance
- Dynamic hostname-based site resolution
- Good developer experience

Next.js is an expected candidate, but analyze whether it is the best choice before committing.

---

## Backend/API

Use:

- Go

The backend must expose a well-designed HTTP API.

Prefer:

- Clear package boundaries
- Explicit domain concepts
- Strong typing
- Simple and idiomatic Go
- Good error handling
- Testability

Do not introduce unnecessary frameworks or abstractions.

Prefer Go's standard library where appropriate.

A router/framework may be used if it provides a clear practical benefit.

---

## Database

Use:

- PostgreSQL

The schema must support:

- Multiple Sites
- Multiple domains per Site
- Posts
- Pages
- Stories
- Hierarchical story organization
- Navigation
- Future extensibility

Use migrations.

---

## Infrastructure

The project must be runnable locally with:

```text
Docker Compose
```

The development environment should include:

```text
Frontend
Backend API
PostgreSQL
```

Provide:

- Environment variable examples
- Clear startup instructions
- Database migrations

---

# 4. Monorepo

Use a monorepo.

Suggested structure:

```text
project/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   └── ...
│
├── docker-compose.yml
│
└── README.md
```

Do not create packages unless they have a real reason to exist.

Avoid creating a large number of tiny packages prematurely.

---

# 5. Domain Model

The system should initially contain the following major concepts.

---

## 5.1 Site

A Site represents one independent website.

Example:

```text
Name:
My Personal Diary

Domains:
diario.meublog.com.br
```

Suggested fields:

```text
id
name
slug
description
created_at
updated_at
```

The exact schema may be improved if necessary.

---

## 5.2 Domain

A Site may have one or more domains.

Example:

```text
Site: Story One

Domains:
historia-01.meublog.com.br
storyone.com
```

Suggested fields:

```text
id
site_id
hostname
is_primary
created_at
```

The hostname must be unique.

The application must resolve:

```text
hostname → Site
```

---

# 6. Posts

The system must support traditional blog posts.

A Post belongs to one Site.

Suggested fields:

```text
id
site_id
title
slug
content
excerpt
status
published_at
created_at
updated_at
```

Status should support at least:

```text
DRAFT
PUBLISHED
```

Design the architecture so additional statuses can be added later.

Posts must support:

- Title
- Slug
- Content
- Drafts
- Publishing
- Publication date
- SEO-friendly URLs

Example:

```text
diario.meublog.com.br/my-first-post
```

---

# 7. Pages

Sites must support custom pages.

Pages are intended for content that does not necessarily belong to the traditional blog timeline.

Examples:

```text
/characters
/trivia
/author-notes
/about
/world
```

A Page belongs to one Site.

Suggested fields:

```text
id
site_id
title
slug
content
status
created_at
updated_at
```

Example:

```text
historia-01.meublog.com.br/characters
```

Pages should be flexible.

Do not initially create specialized database entities for things such as:

- Characters
- Locations
- Trivia
- Author Notes

Use generic Pages first.

Specialized content types can be added later when there is a real need.

---

# 8. Stories

The platform must support fictional stories.

Stories are different from traditional blog posts.

A Story can contain chapters and organized groups of chapters.

Examples of possible structures:

```text
Main Story
│
├── Book 1
│   ├── Chapter 1
│   ├── Chapter 2
│   └── Chapter 3
│
└── Book 2
    ├── Chapter 4
    └── Chapter 5
```

Another story may use:

```text
Season 1
├── Episode 1
├── Episode 2
└── Episode 3
```

Another may use:

```text
Arc 1
├── Chapter 1
└── Chapter 2
```

The database should not unnecessarily force terminology such as:

```text
Book
Season
Arc
```

Instead, use generic concepts that can support different naming conventions.

For example:

```text
Story
└── Story Group
    └── Chapter
```

The UI may allow custom terminology later.

---

# 9. Story Hierarchy

A Story should support hierarchical organization.

Conceptually:

```text
Story
│
├── Group
│   ├── Chapter
│   └── Chapter
│
├── Group
│   ├── Chapter
│   └── Chapter
│
└── Chapter
```

Consider whether the best model is:

### Option A

```text
Story
→ StoryGroup
→ Chapter
```

or a more flexible tree structure.

Choose the simplest model that satisfies current requirements while remaining reasonably extensible.

Do not build an unnecessarily complex generic tree system unless it provides a concrete benefit.

---

# 10. Spin-offs

Stories must support related stories and spin-offs.

A spin-off must **not be forced into the chapter order of the main story**.

Example:

```text
Story Universe
│
├── Main Story
│   ├── Book 1
│   └── Book 2
│
├── Spin-off: Character A
│   ├── Chapter 1
│   └── Chapter 2
│
└── Spin-off: Origins
    ├── Chapter 1
    └── Chapter 2
```

Therefore, model relationships between stories.

A possible concept is:

```text
Story
├── parent_story_id
└── relationship_type
```

Possible relationship types might include:

```text
MAIN
SPINOFF
RELATED
```

However, analyze the best domain model before implementing.

The important requirement is:

> A related story must be able to have its own independent chapters and hierarchy.

---

# 11. Navigation

Each Site must have configurable navigation.

Example:

```text
Home
Stories
Characters
Trivia
Author Notes
About
```

Navigation must not be hardcoded into the frontend.

Suggested concept:

```text
NavigationItem
├── site_id
├── label
├── type
├── destination
├── position/order
└── visibility
```

The exact model may differ.

The system should eventually support navigation items pointing to:

- Home
- Posts
- Stories
- Pages
- External URLs

Implement only what is necessary for Version 1, but do not hardcode the entire website structure.

---

# 12. Hostname-Based Site Resolution

This is a core requirement.

The frontend and/or backend must determine which Site is being accessed based on the hostname.

Examples:

```text
meublog.com.br
→ Site A
```

```text
diario.meublog.com.br
→ Site B
```

```text
historia-01.meublog.com.br
→ Site C
```

The implementation must work locally as well.

Provide a strategy for local development.

For example, explain how local hostnames can be configured.

Do not hardcode production domains.

---

# 13. Admin Area

The platform requires an administrative interface.

Initially, there is only one administrator.

Do not build a complex multi-user SaaS authentication system.

The admin area must eventually allow:

## Site Management

- Create Site
- Edit Site
- Configure domains

## Posts

- Create
- Edit
- Save draft
- Publish

## Pages

- Create
- Edit
- Publish

## Stories

- Create Story
- Create groups
- Create chapters
- Organize chapter order
- Create related stories/spin-offs

## Navigation

- Configure navigation items

---

# 14. Authentication

Version 1 only needs authentication appropriate for a single administrator.

Keep this simple and secure.

Do not implement:

- Organizations
- Teams
- Complex roles
- SaaS subscriptions
- Public user registration

Design the code so authorization can evolve later if necessary.

---

# 15. Content Editor

The platform must provide a good writing experience.

The editor should support at least:

- Paragraphs
- Headings
- Bold
- Italic
- Links
- Lists
- Images
- Code blocks
- Blockquotes

The exact editor library may be chosen based on:

- React compatibility
- Extensibility
- Serialization format
- Long-term maintainability

Before choosing the editor, explain the tradeoffs between:

- Markdown
- Rich text JSON documents
- HTML storage

Choose one deliberately.

The writing experience is an important part of the project.

---

# 16. Public Website

The public sites must prioritize:

- Performance
- SEO
- Readability
- Accessibility
- Responsive design

Each Site should eventually have:

```text
Home
Posts
Stories
Pages
Navigation
```

The exact homepage content may be configured later.

The root domain:

```text
meublog.com.br
```

must work through the same Site architecture.

It may initially function as a simple portal or normal website.

Do not require its purpose to be defined before implementation.

---

# 17. SEO

The platform should be designed for proper SEO.

Support:

- Page titles
- Meta descriptions
- Canonical URLs
- Open Graph metadata
- Sitemap generation
- robots.txt
- Semantic HTML

Do not overbuild advanced SEO features initially.

---

# 18. Content Isolation

This requirement is critical.

Every query involving content must be scoped correctly.

For example:

```text
Post
→ site_id
```

The system must prevent:

```text
Site A
```

from displaying:

```text
Post belonging to Site B
```

The architecture must consistently enforce this isolation.

Do not rely only on frontend filtering.

---

# 19. API Design

Design a clean HTTP API.

Example conceptual routes:

```text
/sites
/sites/{siteId}

/posts
/posts/{postId}

/stories
/stories/{storyId}

/pages
/pages/{pageId}
```

Do not blindly implement these exact routes.

Analyze:

- REST conventions
- Site ownership
- Public vs admin APIs
- Hostname-based public content resolution

Public requests should ideally not require exposing unnecessary administrative APIs.

Clearly separate:

```text
Public API
```

from:

```text
Admin API
```

when appropriate.

---

# 20. Database and Migrations

Use PostgreSQL migrations.

The database must be reproducible from scratch.

The project must provide commands or scripts for:

```text
Create database
Run migrations
Run application
```

Do not require manual SQL execution for normal setup.

---

# 21. Testing

Testing is required.

Prioritize tests for important business logic.

At minimum, test:

## Site Resolution

```text
hostname → correct Site
```

## Content Isolation

Ensure Site A cannot access Site B's content.

## Publishing

Test:

- Draft behavior
- Published behavior
- Public visibility

## Story Organization

Test:

- Chapters
- Ordering
- Groups
- Related/spin-off stories

Avoid writing meaningless tests only to increase coverage.

Focus on behavior that could realistically break.

---

# 22. Code Quality Rules

Use:

- TypeScript strict mode
- Go formatting
- Linting
- Clear naming
- Consistent error handling
- No unnecessary `any`
- No dead code
- No commented-out abandoned implementations

Prefer readable code over clever code.

Do not create abstractions until there is a real reason.

---

# 23. Documentation

Maintain documentation during development.

At minimum provide:

```text
README.md
```

containing:

- Project purpose
- Architecture overview
- Technology stack
- Local setup
- Environment variables
- Docker instructions
- Database instructions
- Development commands

Also document important architectural decisions when they are non-obvious.

---

# 24. Implementation Strategy

Do not attempt to implement everything at once.

Work in phases.

---

## Phase 0 — Planning

Before implementation:

1. Analyze the requirements.
2. Propose the architecture.
3. Propose the database schema.
4. Identify risks and unclear decisions.
5. Define the implementation phases.

Do not invent unnecessary features.

---

## Phase 1 — Foundation

Implement:

- Monorepo
- Frontend application
- Go API
- PostgreSQL
- Docker Compose
- Environment configuration
- Migrations
- Basic health checks

The project must run locally.

---

## Phase 2 — Sites and Domains

Implement:

- Site entity
- Domain entity
- Hostname resolution
- Site isolation

Test:

```text
hostname → Site
```

This is a fundamental milestone.

---

## Phase 3 — Authentication and Admin Foundation

Implement:

- Simple administrator authentication
- Protected admin area
- Basic Site management

Do not build multi-user SaaS functionality.

---

## Phase 4 — Posts

Implement:

- Create
- Edit
- Draft
- Publish
- Public display

Ensure all posts belong to a Site.

---

## Phase 5 — Pages

Implement:

- Create
- Edit
- Draft
- Publish
- Public display

Ensure Pages can support arbitrary future content.

---

## Phase 6 — Stories

Implement:

- Stories
- Story groups
- Chapters
- Ordering
- Related stories
- Spin-offs

Prioritize a clean and understandable domain model.

---

## Phase 7 — Navigation

Implement:

- Configurable navigation
- Ordering
- Internal destinations
- Page links

Do not hardcode each site's menu.

---

## Phase 8 — Writing Experience

Implement and refine:

- Content editor
- Image support
- Preview if appropriate
- Good writing workflow

---

## Phase 9 — Public Site Quality

Improve:

- Responsive design
- Accessibility
- SEO
- Performance
- Reading experience

---

# 25. Important Constraints

Do not turn this into:

- WordPress
- A generic enterprise CMS
- A multi-tenant SaaS product
- A social network
- A public blogging platform

This is initially a:

> Personal multi-site publishing platform.

The project should be powerful enough to support multiple independent sites while remaining understandable and maintainable by one developer.

---

# 26. Product Philosophy

The most important principle is:

> Build the smallest useful version first, then expand based on real usage.

Do not spend weeks implementing features that may never be used.

When a future feature is uncertain, prefer:

```text
Simple generic capability
```

over:

```text
Complex specialized system
```

Examples:

Initially prefer:

```text
Pages
```

instead of immediately creating:

```text
Character Management
Location Management
World Encyclopedia
Trivia Management
```

Those specialized systems can be created later if real usage demonstrates the need.

---

# 27. Expected First Deliverable

Start by producing:

1. A concise architectural proposal.
2. The proposed monorepo structure.
3. The database/domain model.
4. Important technical decisions and tradeoffs.
5. A detailed Phase 1 implementation plan.

After that, begin implementation.

Do not skip planning, but do not remain indefinitely in planning mode.

The goal is to reach a working version quickly where the following is possible:

```text
1. Create a Site
2. Associate a hostname with it
3. Access the Site
4. Write content
5. Publish content
6. View it publicly
```

That is the first meaningful milestone.

---

# Final Instruction

Throughout development, continuously prioritize:

```text
Working software
↓
Correct domain modeling
↓
Maintainability
↓
Extensibility
```

Do not prioritize theoretical architectural complexity over shipping a working publishing platform.

When requirements are ambiguous, explicitly explain the available options and choose the simplest solution that preserves future flexibility.
