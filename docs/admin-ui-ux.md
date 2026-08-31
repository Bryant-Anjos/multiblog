# Admin UI/UX Improvement Plan

## Current State

The admin interface is functional but flat and unintuitive. Key problems:

1. **No site context** — Posts, Pages, Stories pages each independently fetch all sites and show their own site selector dropdown. No persistent "which site am I editing?" state.
2. **Flat navigation** — Sites, Posts, Pages, Stories are equal siblings in the sidebar. Users must mentally map "Posts → select site → find my post."
3. **No "View public site" link** — No way to preview what the public site looks like after editing.
4. **No edit/delete for pages** — Post editor exists at `/admin/posts/[id]`, but pages have no edit route.
5. **Fragile post editor** — Depends on `?site=XXX` query param; navigated to directly, it breaks silently.
6. **No breadcrumbs or back links** — No indication of site context or how to return to the list.
7. **No form validation feedback** — Create/edit forms show no field errors, loading states, or success messages.
8. **No delete confirmations** — Destructive operations (domains, nav items) delete instantly.
9. **Inline story management** — Chapter/group management is a 200-line inline panel with no dedicated URL.
10. **No post/page count metrics** — Site list doesn't show how much content each site has.

---

## Vision: Site-Scoped Admin

Every piece of content belongs to a site. The admin should reflect this hierarchy:

```
Admin (top level)
  Sites list → each site links to site dashboard
  Site dashboard → shows post/page/story counts, quick links
  Site sidebar → Posts, Pages, Stories, Navigation, Domains, Settings
  Site nav shows which site you're in
```

The root-level nav items (Posts, Pages, Stories) are removed entirely. All content management happens within a site context.

---

## Changes

### Phase 1: Site-Scoped Navigation (Critical)

**1. New URL structure**
```
/admin                          → Sites list (existing)
/admin/sites/[id]               → Site dashboard (replace existing detail page)
/admin/sites/[id]/posts         → Posts for this site (NEW)
/admin/sites/[id]/posts/new     → Create post (NEW)
/admin/sites/[id]/posts/[postId] → Edit post (NEW)
/admin/sites/[id]/pages         → Pages for this site (NEW)
/admin/sites/[id]/pages/new     → Create page (NEW)
/admin/sites/[id]/pages/[pageId] → Edit page (NEW)
/admin/sites/[id]/stories       → Stories for this site (NEW)
/admin/sites/[id]/stories/new   → Create story (NEW)
/admin/sites/[id]/navigation    → Navigation items for this site (moved from detail page)
/admin/sites/[id]/settings      → Site settings: name, slug, language, domains (moved from detail page)
```

**2. Remove old global routes**
Delete: `/admin/posts/page.tsx`, `/admin/posts/[id]/page.tsx`, `/admin/pages/page.tsx`, `/admin/stories/page.tsx`

**3. SiteContext provider**
New component wrapping site-scoped pages:
```tsx
// context/SiteContext.tsx
// Fetches site by ID from URL param, provides { site, siteId } to all children
// Shows loading skeleton or 404 if site not found
```

**4. Updated admin shell**
```
┌─────────────────────────────────┐
│ Multiblog        [View Site] [Logout] │
├──────────┬──────────────────────┤
│ Sites    │  Breadcrumb: Sites > My Blog > Posts  │
│──────────│──────────────────────│
│ Posts    │  [content area]       │
│ Pages    │                      │
│ Stories  │                      │
│ Navigation│                     │
│ Settings │                      │
└──────────┴──────────────────────┘
```
- Sidebar shows site name (or "All Sites" on root)
- Sidebar nav items are per-site: Posts, Pages, Stories, Navigation, Settings
- "View Site" link next to Logout, opens public site in new tab
- Breadcrumb at top shows: Sites → [Site Name] → [Section]

### Phase 2: UX Polish (High Priority)

**5. Site dashboard** (`/admin/sites/[id]`)
- Site name, slug, language displayed prominently
- Content summary cards: Posts (X published, Y drafts), Pages (X), Stories (X)
- Quick action buttons: Create Post, Create Page, Create Story
- Domains list with "View Site" links
- Link to Navigation editor
- Link to Settings

**6. Page editor**
- New `/admin/sites/[id]/pages/[pageId]` route
- Same structure as post editor: title, slug (auto-generated), content (textarea), status
- Slug auto-generation from title with debounce

**7. Post/page slug auto-generation**
- On title input, auto-generate slug with debounce (300ms)
- Slug can be manually overridden
- Slugs displayed in the list (helps identify content)

**8. Form validation & feedback**
- Required field indicators (asterisk)
- Field-level error messages below inputs
- Loading state on submit button ("Saving..." with spinner)
- Success toast/banner after save ("Post saved successfully")
- Error toast on API failure

**9. Delete confirmations**
- Confirm dialog before deleting domains, nav items, or content
- Show what will be deleted: "Delete domain mysite.com?"
- Cancel and Confirm buttons

**10. Loading states**
- Skeleton loaders for list pages (skeleton rows)
- Spinner on initial page load
- Optimistic UI where appropriate (e.g., delete removes item immediately)

**11. Empty states**
- When a site has no posts: "No posts yet. Create your first post."
- When a site has no pages: "No pages yet. Create your first page."
- When a site has no stories: "No stories yet. Create your first story."
- Each with a CTA button to create

### Phase 3: Content Editor Improvements (Medium Priority)

**12. Markdown preview in editors**
- Split-pane or toggle between edit and preview
- Uses existing `lib/markdown.ts` for rendering

**13. Story editor improvements**
- Dedicated story edit page at `/admin/sites/[id]/stories/[storyId]`
- Chapter list with drag-to-reorder (or position number inputs)
- Inline chapter editing (title + content)
- Group assignment per story

**14. Rich text toolbar (optional)**
- Basic formatting: bold, italic, heading, link, image
- Toolbar above the textarea
- Still writes markdown (not WYSIWYG)

### Phase 4: Navigation & Domains Improvements (Lower Priority)

**15. Navigation reordering**
- Drag-to-reorder or position number fields
- Visual preview of nav structure

**16. Domain management improvements**
- Show which domain is the primary (first domain)
- "Set as primary" action
- DNS verification status (optional — could be a future feature)

**17. Bulk operations**
- Bulk publish/unpublish posts
- Bulk delete (with confirmation)
- Bulk move to different group (stories)

---

## File Structure Changes

### New files
```
apps/web/src/app/admin/sites/[id]/layout.tsx        — Site-scoped layout with sidebar + breadcrumb
apps/web/src/app/admin/sites/[id]/page.tsx           — Site dashboard
apps/web/src/app/admin/sites/[id]/posts/page.tsx     — Posts list for site
apps/web/src/app/admin/sites/[id]/posts/new/page.tsx — Create post
apps/web/src/app/admin/sites/[id]/posts/[postId]/page.tsx — Edit post
apps/web/src/app/admin/sites/[id]/pages/page.tsx     — Pages list for site
apps/web/src/app/admin/sites/[id]/pages/new/page.tsx — Create page
apps/web/src/app/admin/sites/[id]/pages/[pageId]/page.tsx — Edit page
apps/web/src/app/admin/sites/[id]/stories/page.tsx   — Stories list for site
apps/web/src/app/admin/sites/[id]/stories/new/page.tsx — Create story
apps/web/src/app/admin/sites/[id]/navigation/page.tsx — Navigation editor
apps/web/src/app/admin/sites/[id]/settings/page.tsx  — Site settings
apps/web/src/context/SiteContext.tsx                  — Site context provider
apps/web/src/components/admin/Breadcrumb.tsx         — Breadcrumb component
apps/web/src/components/admin/SiteSidebar.tsx        — Site-scoped sidebar
apps/web/src/components/admin/ConfirmDialog.tsx      — Delete confirmation dialog
apps/web/src/components/admin/Toast.tsx              — Success/error toast
apps/web/src/components/admin/Skeleton.tsx           — Loading skeleton
apps/web/src/components/admin/EmptyState.tsx         — Empty state component
apps/web/src/components/admin/FormField.tsx          — Form field with validation
apps/web/src/components/admin/SlugInput.tsx          — Auto-generating slug input
```

### Modified files
```
apps/web/src/components/admin/AdminShell.tsx         — Add breadcrumbs, site context
apps/web/src/app/admin/sites/[id]/page.tsx           — Becomes dashboard (replace existing)
apps/web/src/app/admin/admin.css                     — Add new component styles
```

### Deleted files
```
apps/web/src/app/admin/posts/page.tsx                — Replaced by site-scoped
apps/web/src/app/admin/posts/[id]/page.tsx           — Replaced by site-scoped
apps/web/src/app/admin/pages/page.tsx                — Replaced by site-scoped
apps/web/src/app/admin/stories/page.tsx              — Replaced by site-scoped
```

---

## Implementation Order

1. **SiteContext provider** — Foundation for all site-scoped pages
2. **Site-scoped layout** (`/admin/sites/[id]/layout.tsx`) — Sidebar + breadcrumb
3. **Site dashboard** — Overview page with counts and quick actions
4. **Migrate Posts to site-scoped** — Move post list/create/edit into site context
5. **Migrate Pages to site-scoped** — Add page list/create/edit (fix missing edit route)
6. **Migrate Stories to site-scoped** — Move story management into site context
7. **Move Navigation to site-scoped** — Extract from site detail page
8. **Move Settings to site-scoped** — Extract from site detail page
9. **Delete old global routes** — Remove old posts/pages/stories pages
10. **Form validation & feedback** — Add to all forms
11. **Loading states & skeletons** — Add to all list pages
12. **Delete confirmations** — Add to all delete actions
13. **Slug auto-generation** — Add to post/page/story editors
14. **Markdown preview** — Add split-pane to editors
15. **"View Site" link** — Add to site dashboard and admin shell

---

## Success Criteria

- [ ] All content management is within a site context (no global posts/pages/stories)
- [ ] Sidebar shows site name and site-specific nav items
- [ ] Breadcrumb shows current location: Sites → [Site] → [Section]
- [ ] "View Site" link opens public site in new tab
- [ ] Page editor exists and works (parity with post editor)
- [ ] All forms show validation errors, loading states, success messages
- [ ] All delete actions show confirmation dialog
- [ ] List pages show skeletons while loading
- [ ] Empty states with CTAs when no content exists
- [ ] Slug auto-generates from title in post/page/story editors
- [ ] No orphaned content (all content tied to a visible site)
