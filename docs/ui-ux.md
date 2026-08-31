# UI/UX Implementation Specification — Personal Publishing Platform

Implement the public-facing UI of the personal publishing platform described in the project specification.

The visual design must prioritize:

- Reading
- Written content
- Simplicity
- Calmness
- Focus
- Long-form reading
- Easy navigation

The main visual inspiration is the experience of reading on a Kindle or reading a well-designed digital book, adapted into a modern website.

The interface should feel like a **personal digital library**, not like a corporate dashboard or a generic SaaS application.

Avoid:

- Excessive cards
- Excessive shadows
- Bright colors
- Gradients
- Large decorative elements
- Dense interfaces
- Dashboard-style information overload
- Social media aesthetics

The content must always be the visual priority.

---

# 1. Overall Visual Direction

Use a warm, neutral visual palette inspired by:

- Paper
- Books
- Kindle reading environments
- Libraries
- Ink
- Warm light

The general feeling should be:

> Calm, literary, minimalist, warm, and focused.

Use a combination of:

- Warm off-white backgrounds
- Cream tones
- Light beige borders
- Dark charcoal text

Do not make the interface completely pure white unless necessary.

The visual hierarchy should be subtle.

The UI should feel comfortable for reading for long periods.

---

# 2. Typography

Typography is one of the most important parts of the design.

Use two complementary typography styles.

## Headings

Use a serif font for:

- Article titles
- Story titles
- Important headings
- Literary content

The serif typography should give the interface a book-like feeling.

Examples of suitable font categories:

- Literary serif
- Editorial serif
- Classic book typography

Avoid overly decorative serif fonts.

---

## Interface Text

Use a clean sans-serif font for:

- Navigation
- Buttons
- Metadata
- Labels
- Dates
- UI controls

The interface font should be highly readable and understated.

---

## Typography Hierarchy

The hierarchy should clearly distinguish:

```text id="qpdifz"
Article Title
```

from:

```text id="1rc23d"
Section Heading
```

from:

```text id="x6nqz0"
Metadata
```

Metadata such as dates and reading time should be small and visually quiet.

Example:

```text id="gooz6n"
DIARY · MAY 12, 2026
```

Use uppercase or subtle letter spacing for section labels and metadata.

---

# 3. Desktop Layout

The desktop interface uses a two-column structure.

```text id="pxbgu3"
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Main Content                              │
│         │                                           │
│         │                                           │
│         │                                           │
└──────────────────────────────────────────────────────┘
```

The left sidebar is persistent on desktop.

The main content occupies the remaining space.

---

# 4. Left Sidebar

The sidebar should feel like the navigation panel of a personal library.

Approximate width:

```text id="bknwim"
240px – 280px
```

The sidebar should have a subtle border separating it from the main content.

Do not use a heavy dark sidebar.

The background should remain close to the main background, possibly slightly different.

---

## 4.1 Site Identity

At the top of the sidebar:

```text id="2hj1u7"
📖  My Blog
```

Use a simple book icon.

Below the title:

```text id="fr5ggm"
Stories, ideas and records
from a journey.
```

The description should be small and subdued.

The site title should use a serif font.

---

# 5. Primary Navigation

Below the identity, show the primary navigation.

Example:

```text id="sve5b6"
⌂  Home

▤  Blog

📖  Stories

▤  Pages

♙  About
```

Use simple line icons.

The active page should have:

- A very subtle warm background
- Slight rounding
- No strong color
- No excessive visual emphasis

The navigation should feel quiet.

Avoid large buttons.

---

# 6. Content Navigation

Below the main navigation, create a separate section:

```text id="1wzvxb"
CONTENT
```

The label should be small and subtle.

Example items:

```text id="8e9qxd"
◷  Recent Posts

📖  Stories

✎  Author Notes

♙  Characters

☆  Trivia
```

This section can contain important content areas of the site.

The exact items should eventually be configurable from the site's navigation configuration.

Do not hardcode the architecture permanently.

---

# 7. Search

Near the lower portion of the sidebar, include a search section.

Example:

```text id="6urll0"
Search

┌──────────────────────┐
│ Search...          🔍 │
└──────────────────────┘
```

The search input should:

- Be compact
- Have a subtle border
- Have slightly rounded corners
- Avoid excessive styling

Search should eventually allow searching across the current Site's content.

---

# 8. Reading and Theme Controls

At the bottom of the sidebar, include reading-related controls.

Example:

```text id="ghyzsl"
Theme

☀  ☾

Reading mode

[ toggle ]
```

These controls should eventually support:

- Light mode
- Dark mode
- Reading preferences

The design should make these controls feel secondary.

---

# 9. Main Content Area

The main content area should have generous horizontal padding.

Do not make the content stretch excessively across very large screens.

The layout should prioritize readability.

At the top:

```text id="d0qzk7"
☰                                      ☾  Aa
```

The left side contains a menu control.

The right side contains:

- Theme toggle
- Typography/reading settings

Use a subtle horizontal border below the top bar.

---

# 10. Homepage

The homepage is composed of several content-focused sections.

The order should be:

```text id="3gvnlq"
Featured Content

Recent Posts

Stories

Pages / Explore
```

The homepage should not feel like a dashboard.

It should feel like opening the front page of a personal publication.

---

# 11. Featured Content

At the top of the homepage:

```text id="ueahb3"
FEATURED
```

Then display a large featured article.

Desktop layout:

```text id="zdx24a"
┌───────────────────────────────────────────────┐
│                                               │
│  Article Content          │   Cover Image     │
│                           │                   │
│  Article title            │                   │
│                           │                   │
│  Description              │                   │
│                           │                   │
│  Reading time             │                   │
│                           │                   │
│  [ Read article → ]       │                   │
│                           │                   │
└───────────────────────────────────────────────┘
```

The featured section should be visually prominent but still calm.

---

## Featured Article Content

Example:

```text id="cvknfm"
DIARY · MAY 12, 2026

Starting is more important
than being perfect

Sometimes we wait for the perfect moment,
the perfect motivation, or the perfect plan.
But the truth is that the only path forward
is to begin with what we have today.

5 min read

[ Read article → ]
```

The article title should use a large serif font.

The description should have comfortable line spacing.

The call-to-action should be understated.

Use a dark neutral button rather than a bright colored button.

---

## Featured Image

The right side contains a large image.

Example visual themes:

- Open book
- Notebook
- Kindle
- Writing desk
- Coffee and books

The image should have:

- Slightly rounded corners
- No excessive border
- A cinematic but natural appearance

The image should occupy approximately half of the featured section.

---

# 12. Recent Posts

Below the featured section:

```text id="55c2t4"
RECENT POSTS                         View all →
```

Display posts as a vertical list.

Each item:

```text id="a7y7zo"
┌─────────────────────────────────────────────┐

[ Document Icon ]

Title

Short description of the article...

MAY 10, 2026 · 7 MIN READ

                                             →

─────────────────────────────────────────────
```

Each post row should contain:

### Left

A subtle square containing an icon.

### Center

- Title
- Short excerpt
- Metadata

### Right

A subtle arrow.

The rows should have generous vertical spacing.

Do not place every post inside a heavily elevated card.

Prefer separators or extremely subtle borders.

---

# 13. Stories Section

Below recent posts:

```text id="inil2f"
STORIES                              View all →
```

Display stories in a horizontal grid.

Example desktop layout:

```text id="g5zj0c"
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│              │ │              │ │              │
│ 📖           │ │ 📖           │ │ 📖           │
│              │ │              │ │              │
│ Main Story   │ │ Spin-off     │ │ Spin-off     │
│              │ │ Origins      │ │ Character X  │
│              │ │              │ │              │
│ 2 BOOKS      │ │ 1 BOOK       │ │ 1 BOOK       │
│ 15 CHAPTERS  │ │ 8 CHAPTERS   │ │ 5 CHAPTERS   │
│              │ │              │ │              │
│ Description  │ │ Description  │ │ Description  │
│              │ │              │ │              │
│ ━━━━━━━━──   │ │ ━━━───       │ │ ━─           │
│ 65%          │ │ 30%          │ │ 10%          │
└──────────────┘ └──────────────┘ └──────────────┘
```

Each Story card should be subtle.

Use:

- Thin border
- Warm background
- Moderate rounded corners
- Generous padding

Avoid strong shadows.

---

## Story Progress

Include a subtle progress indicator.

Example:

```text id="yzrx1l"
━━━━━━━────────

65%
```

This could represent:

- Reading progress
- Story completion
- Published chapters

The exact meaning should be clearly defined in the product.

---

# 14. Pages / Explore Section

Below Stories:

```text id="nt8kxm"
PAGES                                View all →
```

Display important pages in a horizontal layout.

Example:

```text id="dxf4a0"
✎ Author Notes

Reflections, behind-the-scenes,
and the creative process.


♙ Characters

Learn more about the characters
from the stories.


☆ Trivia

Facts, references and details
about the universe.
```

These items should feel lightweight.

They should not look like large cards.

A minimal icon, title, description, and arrow is sufficient.

---

# 15. Bottom Navigation

At the bottom of reading pages, include article navigation.

Example:

```text id="8gghu9"
← Previous

Lessons I learned from reading more


                         Next →

                The power of small habits
```

This should allow comfortable sequential reading.

The bottom navigation should be particularly useful for:

- Blog posts
- Story chapters

---

# 16. Article Reading Page

The article page is the most important page in the entire platform.

It should prioritize reading above everything else.

The reading layout should be significantly narrower than the homepage.

Example:

```text id="l73y8g"
            ARTICLE

     Starting is more important
          than being perfect

     MAY 12, 2026 · 5 MIN READ

────────────────────────────────

     Article content begins here...

     The text should have a comfortable
     maximum width and generous line
     height.

     Reading should feel similar to a
     high-quality ebook or digital book.

────────────────────────────────

← Previous                 Next →
```

---

## Reading Width

Do not allow paragraphs to become excessively wide.

Use a maximum readable line length.

Prioritize:

```text id="1s9q2a"
Comfortable reading
```

over:

```text id="n1r3ab"
Maximum content width
```

---

## Article Typography

Article text should use:

- Serif font
- Comfortable font size
- Generous line height
- Good paragraph spacing

Headings should be clearly separated.

The reading experience should feel closer to:

```text id="rdmjgm"
Book
```

than:

```text id="du5o1l"
Corporate website
```

---

# 17. Story Reading Page

Stories should use a similar reading interface.

However, story navigation should include additional context.

Example:

```text id="ut4vrw"
THE CHRONICLES OF ...

BOOK 1

CHAPTER 4

The Beginning of the Journey
```

Then the story content.

At the end:

```text id="ejmr4p"
← Previous Chapter

Back to Book

Next Chapter →
```

The reader should always understand:

- Which Story they are reading
- Which Book/Group they are in
- Which Chapter they are reading

But this information should not distract from the text.

---

# 18. Reading Settings

Provide a reading settings control.

The `Aa` button in the top bar can open a small settings panel.

Eventually support:

## Font Size

```text id="cjccyq"
Small
Medium
Large
```

## Font Family

Potentially:

```text id="pijovx"
Serif
Sans-serif
```

## Reading Width

Potentially:

```text id="4yqymq"
Normal
Wide
```

## Theme

```text id="ttn80g"
Light
Dark
Warm
```

The initial implementation can keep these features simple.

However, the UI architecture should allow them to be added naturally.

---

# 19. Dark Mode

Dark mode should not use pure black.

Use a warm dark theme.

Example direction:

```text id="a6m2er"
Background:
Dark charcoal / warm brown

Text:
Warm off-white

Borders:
Subtle dark gray/brown
```

The feeling should remain literary and comfortable.

Avoid:

```text id="tvwrtw"
#000000
```

as the main background.

---

# 20. Mobile Layout

The mobile experience must be designed specifically.

Do not simply shrink the desktop layout.

On mobile:

```text id="ptm2sd"
┌─────────────────────────┐
│ ☰     My Blog       Aa  │
├─────────────────────────┤
│                         │
│ FEATURED                │
│                         │
│ Starting is more...     │
│                         │
│ [ Image ]               │
│                         │
│ Recent Posts            │
│                         │
│ Story Cards →           │
│                         │
└─────────────────────────┘
```

The sidebar becomes a slide-out navigation menu.

The main reading content should use comfortable mobile margins.

Story cards may become horizontally scrollable if appropriate.

The primary objective on mobile remains:

> Comfortable reading.

---

# 21. Interaction Design

Interactions should be subtle.

Use:

- Small hover changes
- Slight background changes
- Gentle transitions

Avoid:

- Excessive animations
- Bouncing elements
- Large transformations
- Distracting effects

The interface should feel stable.

---

# 22. Accessibility

The interface must support:

- Keyboard navigation
- Proper focus states
- Semantic HTML
- Sufficient contrast
- Accessible navigation
- Responsive font sizing

Do not remove focus indicators without replacing them.

---

# 23. Component Architecture

Create reusable UI components where appropriate.

Examples:

```text id="dyl45y"
Layout
Sidebar
TopBar

Navigation
NavigationItem

SectionHeader

FeaturedArticle

PostList
PostListItem

StoryCard
StoryGrid

PageLink

ArticleLayout
StoryReader

ReadingSettings
ThemeToggle
```

Do not create unnecessary components for trivial markup.

The component architecture should support multiple Sites using the same UI system.

---

# 24. Site Customization

The platform supports multiple independent Sites.

The UI should therefore eventually allow each Site to configure:

- Site name
- Description
- Logo
- Navigation
- Featured content

The first implementation does not need a complete theme customization system.

However, avoid hardcoding:

```text id="ds8e8d"
My Blog
```

throughout the application.

Site identity must come from Site data.

---

# 25. Final Design Principles

The implementation must consistently follow these principles:

## Content first

Written content is the most important visual element.

---

## Reading comfort

The user should be able to read for long periods without visual fatigue.

---

## Calm interface

The UI should not compete with the content.

---

## Literary feeling

Use typography and spacing to create the feeling of reading a personal publication or digital book.

---

## Simple navigation

Users should always understand:

- Where they are
- What they can read
- How to continue

---

## Minimal visual noise

Every UI element should justify its existence.

When in doubt:

> Remove visual complexity rather than adding decoration.

---

# Implementation Instruction

Implement the UI based on this specification.

Before writing all pages, first:

1. Define the design tokens.
2. Choose the typography.
3. Implement the main layout.
4. Implement the responsive sidebar/navigation.
5. Implement the homepage sections.
6. Implement the article reading layout.
7. Implement the story/chapter reading layout.

Use realistic mock data initially if the backend integration is not yet available.

Do not focus on building an admin dashboard in this UI phase.

The priority is the **public reading and publishing experience**.

The final result should feel like:

> A modern personal library for blogs, stories, notes, and written worlds.
