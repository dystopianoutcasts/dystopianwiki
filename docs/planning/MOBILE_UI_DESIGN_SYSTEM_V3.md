# Mobile UI/UX Design System v3 (Final)

> **Version History**: v1 (initial), v2 (refinements from second designer), v3 (merged final)
>
> **Last Updated**: January 2026

## Design Philosophy

Mobile-native "codex companion" for a multi-game modding wiki: fast discovery, comfortable reading, offline-first reliability, AAA polish without noise.

### Design Intent
"AAA game-studio codex + encyclopedia utility" - a tool modders trust daily. Think Blizzard's in-game encyclopedias or Riot's companion apps, but for modding documentation.

### Guiding Principles

1. **Dark-First, Eye-Friendly** - Optimized for extended reading with comfort-first text colors
2. **Bottom Tab Navigation** - Primary destinations within thumb reach
3. **Content-First** - UI gets out of the way when reading
4. **Bento Discovery** - Variable card layouts for visual hierarchy on Home
5. **Micro-Interactions + Haptics** - Purposeful feedback that confirms actions (not distracts)
6. **Offline-First** - Explicit download states, graceful degradation, searchable offline
7. **Accessibility-First** - Scalable text, reduced motion support, never color-only indicators

### Reading Modes (Phase 2)
- **Focus** (default): Neutral, minimal saturation, reduced motion
- **Night**: Warmer paper-like contrast, reduced highlights for late-night reading

*Rationale: Two modes cover 99% of use cases. Additional modes add maintenance burden.*

---

## Brand Alignment

### Color System (Semantic Tokens)

The current mobile theme uses pure blacks (`#0a0a0a`) which differs from the web's navy-tinted dark theme. **Recommendation: Align with web's navy palette for brand consistency.**

#### Complete Token Ramps

**Navy Scale (Backgrounds & Surfaces):**
```
navy.950    #050d18    Deepest background (modals backdrop)
navy.900    #0a1628    bg.base - Primary background
navy.800    #0f1f35    bg.surface1 - Cards, elevated surfaces
navy.700    #1e3a5f    bg.surface2 - Hover states, borders
navy.600    #264a78    bg.surface3 - Active states, strong borders
navy.500    #3b6491    Interactive hover
navy.400    #5a8ab8    Disabled text, subtle icons
navy.300    #8cb3d9    Secondary text alternative
navy.200    #b8d4ee    High contrast text
navy.100    #e0eef9    Inverted backgrounds
navy.50     #f0f7fc    Light mode base (future)
```

**Orange/Accent Scale (Brand Color):**
```
accent.950  #4a2008    Darkest accent (rarely used)
accent.900  #7c340d    Dark backgrounds with accent tint
accent.800  #9a4014    Strong pressed states
accent.700  #b85a1a    Pressed state
accent.600  #c96820    Active state
accent.500  #d4782c    PRIMARY - Buttons, links, CTAs
accent.400  #e08940    Hover state
accent.300  #f0a860    Light accent (text on dark)
accent.200  #f5c896    Muted accent (badges)
accent.100  #fae3c8    Very light accent
accent.50   #fef3e6    Accent tinted backgrounds
```

#### Semantic Token Mapping

```
TOKEN NAME              VALUE           USE CASE
────────────────────────────────────────────────────────────────────
BACKGROUNDS
bg.base                 navy.900        Main app background
bg.surface1             navy.800        Cards, list items
bg.surface2             navy.700        Nested cards, hovers
bg.surface3             navy.600        Active selections
bg.overlay              navy.950 @ 80%  Modal backdrops

BORDERS & DIVIDERS
border.subtle           navy.700        Default borders
border.strong           navy.600        Focused/active borders
border.accent           accent.500      Highlighted borders
divider.default         navy.700 @ 50%  List separators (lighter than border)

TEXT (Comfort-First)
text.primary            #f1f5f9         Main content (off-white for reading comfort)
text.secondary          #94a3b8         Supporting text (blue-tinted)
text.muted              #64748b         Disabled, hints, captions
text.link               accent.400      Links, interactive text
text.inverse            navy.900        Text on light backgrounds

ACCENT
accent.default          accent.500      Primary actions
accent.hover            accent.400      Hover states
accent.pressed          accent.600      Pressed states
accent.muted            accent.300      Subtle accent text

STATUS
status.success          #4ade80         Beginner difficulty, positive feedback
status.warning          #fbbf24         Intermediate difficulty, caution
status.error            #ff6b6b         Advanced difficulty, destructive actions
status.info             #60a5fa         Informational messages

INTERACTIVE
focus.ring              accent.400 @ 50% Keyboard/accessibility focus indicator
```

#### Additional Design Tokens (v2 additions)

```
SPACING (4pt base grid)
spacing.1               4px             Tight padding
spacing.2               8px             Small gaps
spacing.3               12px            Medium gaps
spacing.4               16px            Standard padding
spacing.5               20px            Section gaps
spacing.6               24px            Large gaps
spacing.7               32px            Section separators
spacing.8               48px            Major sections

BORDER RADIUS
radius.sm               4px             Badges, chips
radius.md               8px             Buttons, inputs
radius.lg               12px            Cards
radius.xl               16px            Modals, sheets
radius.full             9999px          Pills, avatars

ELEVATION (shadows)
elevation.1             0 1px 2px navy.950 @ 20%    Subtle lift (chips)
elevation.2             0 2px 4px navy.950 @ 25%    Cards
elevation.3             0 4px 8px navy.950 @ 30%    Dropdowns, FAB
elevation.4             0 8px 16px navy.950 @ 35%   Modals
```

#### Contrast Verification (WCAG AA)

**On bg.base (#0a1628):**
| Token | Color | Ratio | Status |
|-------|-------|-------|--------|
| text.primary | #f1f5f9 | 14.8:1 | ✓ AAA |
| text.secondary | #94a3b8 | 7.2:1 | ✓ AA |
| text.muted | #64748b | 4.7:1 | ✓ AA large |
| accent.default | #d4782c | 5.8:1 | ✓ AA |

**On bg.surface1 (#0f1f35):**
| Token | Color | Ratio | Status |
|-------|-------|-------|--------|
| text.primary | #f1f5f9 | 13.2:1 | ✓ AAA |
| text.secondary | #94a3b8 | 6.4:1 | ✓ AA |
| text.muted | #64748b | 4.2:1 | ✓ AA large |

**On bg.surface2 (#1e3a5f):**
| Token | Color | Ratio | Status |
|-------|-------|-------|--------|
| text.primary | #f1f5f9 | 9.8:1 | ✓ AAA |
| text.secondary | #94a3b8 | 4.8:1 | ✓ AA |
| text.muted | #64748b | 3.1:1 | ⚠️ Avoid small text |

*Rationale: Off-white (#f1f5f9) reduces eye strain vs pure white during long reading sessions while maintaining excellent contrast.*

### Typography (Readability-First)

**Critical insight:** A wiki is 90% long-form reading. Brand expression must not compromise readability.

#### Font Usage

```
USAGE               FONT                    RATIONALE
─────────────────────────────────────────────────────────────
App name/logo       Russo One               Brand moments only
Section headers     Russo One (optional)    Dystopian identity
H1 article titles   Russo One               Hero treatment
Body text           System default          Maximum readability
UI elements         System default          Native feel
Code blocks         JetBrains Mono          Developer standard
```

**Why system fonts for body:**
- Optimized for each platform (San Francisco on iOS, Roboto on Android)
- No bundle size increase
- Users already comfortable reading them
- Respects accessibility settings

*Russo One loaded via expo-font for brand moments only.*

#### Reading Specifications (v2 addition)

```
ELEMENT             SIZE        LINE-HEIGHT     SPACING
─────────────────────────────────────────────────────────────
Body text           16sp min    1.5 (24px)      -
Paragraph spacing   -           -               12-16px between
Code blocks         14sp        1.6 (22px)      Increased for scanning
Captions            14sp        1.4 (20px)      -
H1 (article)        28sp        1.2             24px below
H2                  22sp        1.3             20px above, 12px below
H3                  18sp        1.3             16px above, 8px below
```

**Dynamic Type Support:**
- Minimum body: 16sp
- Maximum tested: 200% (32sp)
- All containers must handle text reflow
- Never truncate body text (excerpts allowed in lists)

---

## Screen-by-Screen Design Specifications

### Navigation Structure: Bottom Tabs

```
┌─────────────────────────────────┐
│                                 │
│         (Screen Content)        │
│                                 │
├─────────────────────────────────┤
│  🏠       🔍       📥       👤  │  ← Bottom Tab Bar
│  Home    Search   Saved   Profile│
└─────────────────────────────────┘
```

**Why Bottom Tabs:**
- Thumb-friendly (primary actions within reach)
- Standard pattern users expect
- Replaces quick action buttons (now redundant)
- 4 tabs is optimal (5 max)

#### Game Context Rules (v2 addition)

The app is game-agnostic. Users must always know "where they are."

**Global scope default:** All Games

**When user selects a game, show persistent context in:**
- Search results summary: "12 results in Project Zomboid"
- Categories header: "PROJECT ZOMBOID · BUILD 41"
- Article breadcrumb: "PZ > Modding > Lua API"

**Context persistence:**
- Game selection persists across sessions
- Changing game clears search but keeps bookmarks visible
- "All Games" shows combined results

#### Deep Linking (v2 addition)

Support deep links for community sharing and Discord integration:

```
LINK TYPE                   FORMAT
─────────────────────────────────────────────────────────────
Article                     dystopianwiki://article/{slug}
Category                    dystopianwiki://category/{game}/{category}
Game hub                    dystopianwiki://game/{game-id}
Search                      dystopianwiki://search?q={query}&game={game}
Discord invite              dystopianwiki://discord
```

**Implementation:**
- Configure in app.json scheme + intentFilters
- Handle in root navigator with linking config
- Fallback: show "Article not found" if invalid

---

### 1. HOME SCREEN (Bento Layout)

```
┌─────────────────────────────────┐
│  DYSTOPIAN WIKI           [👤] │  ← Header with avatar
├─────────────────────────────────┤
│                                 │
│  🔍 Search mods, Lua, items...  │  ← Tier-0 search (tappable)
│  [All Games ▾] [Guides] [API]   │  ← Scope + filter chips
│                                 │
│  GAMES                          │
│  ┌──────────┐ ┌──────────┐     │
│  │    🧟    │ │    ⛏️    │     │  ← Bento grid (2-col)
│  │ Project  │ │ Vintage  │     │
│  │ Zomboid  │ │  Story   │     │
│  │ 124 docs │ │  58 docs │     │
│  └──────────┘ └──────────┘     │
│                                 │
│  ┌─────────────────────────┐   │  ← Featured (full-width)
│  │ ⭐ FEATURED              │   │
│  │ Getting Started Guide    │   │
│  │ New to modding? Start... │   │
│  └─────────────────────────┘   │
│                                 │
│  CONTINUE READING               │  ← Only if user has progress
│  ┌─────────────────────────┐   │
│  │ ████████░░░░ 65%        │   │
│  │ Item Properties Guide   │   │
│  └─────────────────────────┘   │
│                                 │
│  RECENT ARTICLES                │
│  ┌─────────────────────────┐   │
│  │ Creating Custom Items   │   │
│  │ ▪️ Beginner · Items     │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  🏠       🔍       📥       👤  │
│  Home    Search   Saved   Profile│
└─────────────────────────────────┘
```

**Bento Layout Features:**
- Variable card sizes (2-col grid + full-width featured)
- Game cards show article counts
- Search is "Tier-0" (most prominent element)
- Filter chips for quick filtering
- Continue Reading only shows if user has in-progress articles

---

### 2. ARTICLE SCREEN

```
┌─────────────────────────────────┐
│  ◄ Back                   [🔖] │  ← Bookmark in header
├─────────────────────────────────┤
│                                 │
│  ITEMS                          │  ← Category breadcrumb
│                                 │
│  Creating Custom Items          │  ← Title (h1, Russo One)
│                                 │
│  ▪️ Beginner · 8 min read       │  ← Meta row
│                                 │
│  ┌─────────────────────────┐   │
│  │ TABLE OF CONTENTS    ▼  │   │  ← Collapsible TOC
│  │  • Introduction         │   │
│  │  • Prerequisites        │   │
│  │  • Step 1: Setup        │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  This guide will teach you...   │  ← Article content
│                                 │
│  ## Prerequisites               │
│                                 │
│  Before starting, ensure you    │
│  have:                          │
│  • Project Zomboid installed    │
│  • A text editor                │
│                                 │
│  ```lua                         │
│  local item = {                 │  ← Code block (syntax hl)
│    type = "Normal",             │
│    displayName = "My Item"      │
│  }                              │
│  ```                            │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  RELATED ARTICLES               │
│  ┌───────────┐ ┌───────────┐   │  ← Horizontal scroll
│  │ Item Props│ │ Lua Basics│   │
│  └───────────┘ └───────────┘   │
│                                 │
└─────────────────────────────────┘
     ┌─────────────────────┐
     │  ▲ TOP    📖 TOC    │       ← Floating action bar
     └─────────────────────┘         (appears on scroll)
```

**Key Features:**
- Bookmark moved to header (always visible)
- Collapsible Table of Contents
- Reading time estimate
- Floating action bar for quick navigation
- Horizontal scroll for related articles

#### Markdown Renderer Rules (v2 addition)

**Table of Contents:**
- Tapping TOC item scrolls to section with offset for header
- Active section highlighted in TOC as user scrolls
- TOC is navigable list for screen readers

**Code Blocks:**
```
┌─────────────────────────────────┐
│ lua                       [📋] │  ← Language label + copy button
├─────────────────────────────────┤
│ local item = {                  │
│   type = "Normal",              │
│   displayName = "My Item"       │
│ }                               │
└─────────────────────────────────┘
  [Wrap] [Scroll]                    ← Optional toggle for long lines
```
- Copy button with haptic + "Copied!" toast
- Syntax highlighting via react-native-syntax-highlighter
- Long lines: default scroll, optional wrap toggle

**Tables:**
- Render as horizontally scrollable cards
- Never break table layout
- Shadow/fade on edges to indicate scroll

**Links:**
- Internal links (same domain): open in-app, push new article screen
- External links: show confirmation "Open in browser?" with URL preview
- Broken links: show inline error, don't crash

**Images:**
- Tap to open fullscreen lightbox with pinch-zoom
- Loading: skeleton placeholder with image dimensions if known
- Offline missing: show placeholder icon + "Image not downloaded"
- Alt text always visible below image

---

### 3. SEARCH SCREEN

```
┌─────────────────────────────────┐
│  ◄ Search                       │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔍 lua events...     ✕  │   │  ← Search with clear button
│  └─────────────────────────┘   │
│                                 │
│  SCOPE                          │
│  ┌─────────┐ ┌─────────┐       │
│  │All Games│ │PZ       │ │VS   │ ← Game filter (single select)
│  └─────────┘ └─────────┘       │
│                                 │
│  CONTENT TYPE                   │
│  ┌───────┐ ┌───────┐ ┌───────┐ │
│  │All    │ │Guides │ │API    │ │ ← Type filter (multi-select)
│  └───────┘ └───────┘ └───────┘ │
│  ┌───────┐ ┌───────┐           │
│  │Scripts│ │Config │           │
│  └───────┘ └───────┘           │
│                                 │
│  DIFFICULTY                     │
│  ┌────────┐ ┌────────┐ ┌─────┐ │
│  │All     │ │Beginner│ │Inter│ │ ← Difficulty (single select)
│  └────────┘ └────────┘ └─────┘ │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔄 Clear filters        │   │ ← Reset all filters
│  └─────────────────────────┘   │
│                                 │
│  12 results for "lua events"    │
│  in Project Zomboid · Guides    │  ← Shows active filters
│                                 │
│  ┌─────────────────────────┐   │
│  │ Lua Event Hooks         │   │
│  │ Learn how to hook into  │   │
│  │ game events using Lua...│   │
│  │ ▪️ Intermediate · Lua API│   │
│  │ 📥 Downloaded           │   │  ← Offline availability
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Custom Events           │   │
│  │ Create your own event   │   │
│  │ system for mod...       │   │
│  │ ▪️ Advanced · Lua API   │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Search Filter System:**

| Filter Type | Options | Behavior |
|-------------|---------|----------|
| **Game Scope** | All Games, Project Zomboid, Vintage Story | Single-select, persists across sessions |
| **Content Type** | All, Guides, API Reference, Scripts, Config | Multi-select (can combine) |
| **Difficulty** | All, Beginner, Intermediate, Advanced | Single-select |
| **Version** | (Auto from game) Build 41, Build 42 Beta | Single-select, only shows if game selected |

**Filter Chip States:**
- **Default**: Navy 800 bg, text.secondary
- **Selected**: Accent 500 bg, text.primary
- **Multi-selected**: Accent outline, accent.muted bg

**Key Features:**
- Game scope filter (most important for multi-game wiki)
- Content type for finding specific documentation types
- Clear filters button when any filter is active
- Active filters shown in result summary
- Offline availability indicator on results
- Results persist game filter preference

#### Search Ranking & Behavior (v2 addition)

**Instant Search:**
- Show suggestions after 2-3 characters typed
- Debounce: 300ms after last keystroke
- Submit (Enter/Search button) for full results with filters

**Result Ranking Priority:**
1. **Title match** (exact > partial > fuzzy)
2. **Heading/TOC match** (H2, H3 within article)
3. **Body text match** (full content search)
4. **Tag match** (content type, version, difficulty)

**Match Highlighting:**
- Highlight matched terms in title (bold)
- Highlight matched terms in excerpt snippet
- Show which field matched: "Found in: Headings"

**No Results State:**
```
┌─────────────────────────────────┐
│                                 │
│         🔍                      │
│                                 │
│  No results for "xyz"           │
│                                 │
│  Try:                           │
│  • Different keywords           │
│  • Removing filters             │
│  • Checking spelling            │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Clear all filters         │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

---

### 4. BOOKMARKS SCREEN

```
┌─────────────────────────────────┐
│  ◄ Saved Articles               │
├─────────────────────────────────┤
│                                 │
│  ┌────────┐ ┌────────┐         │
│  │All (12)│ │Unread 8│ │Read 4 │ ← Tab filters
│  └────────┘ └────────┘         │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Item Properties Guide   │   │
│  │ ████████░░░░ 65%        │   │  ← Progress bar if started
│  │ ▪️ Beginner · Items     │   │
│  │                    [⋮]  │   │  ← Overflow menu (remove)
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Lua Event Hooks         │   │
│  │ Not started             │   │
│  │ ▪️ Intermediate · API   │   │
│  │                    [⋮]  │   │
│  └─────────────────────────┘   │
│                                 │
│           - OR -                │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │     📚                  │   │  ← Empty state
│  │                         │   │
│  │  No saved articles yet  │   │
│  │                         │   │
│  │  Tap the bookmark icon  │   │
│  │  to save articles for   │   │
│  │  offline reading.       │   │
│  │                         │   │
│  │  [Browse Articles]      │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Key Changes:**
- Tab filters (All/Unread/Read)
- Reading progress shown on cards
- Overflow menu instead of X button (less accidental taps)
- Better empty state with illustration

---

### 5. PROFILE SCREEN

```
┌─────────────────────────────────┐
│  ◄ Profile                      │
├─────────────────────────────────┤
│                                 │
│         ┌─────────┐             │
│         │   E     │             │  ← Avatar (initial or image)
│         └─────────┘             │
│                                 │
│        edgar_dev                │  ← Username
│     edgar@example.com           │  ← Email (smaller)
│                                 │
│  ─────────────────────────────  │
│                                 │
│  YOUR STATS                     │
│  ┌───────────┬───────────┐     │
│  │    12     │     4     │     │
│  │  Saved    │ Completed │     │
│  └───────────┴───────────┘     │
│                                 │
│  SETTINGS                       │
│  ┌─────────────────────────┐   │
│  │ 🌙 Dark Mode      [ON]  │   │  ← Future: theme toggle
│  ├─────────────────────────┤   │
│  │ 📱 Offline Mode   [ON]  │   │  ← Download for offline
│  ├─────────────────────────┤   │
│  │ 🔔 Notifications  [OFF] │   │  ← Future feature
│  └─────────────────────────┘   │
│                                 │
│  ACCOUNT                        │
│  ┌─────────────────────────┐   │
│  │ 📧 Change Email         │   │
│  ├─────────────────────────┤   │
│  │ 🔑 Change Password      │   │
│  ├─────────────────────────┤   │
│  │ 🚪 Sign Out             │   │  ← Red text
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🗑️ Delete Account       │   │  ← Destructive, separate
│  └─────────────────────────┘   │
│                                 │
│  v1.0.0 · Made by Dystopian    │  ← App version footer
│  Outcasts Community            │
│                                 │
└─────────────────────────────────┘
```

---

### 6. CATEGORIES SCREEN

```
┌─────────────────────────────────┐
│  ◄ Browse                       │
├─────────────────────────────────┤
│                                 │
│  PROJECT ZOMBOID · BUILD 41     │  ← Game/version context
│                                 │
│  MODDING                        │
│  ┌─────────────────────────┐   │
│  │ 🔧 Lua API              │   │
│  │ Core functions and      │   │
│  │ event hooks             │   │
│  │ 32 articles        ───► │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📦 Items                │   │
│  │ Create weapons, food,   │   │
│  │ tools and more          │   │
│  │ 18 articles        ───► │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🗺️ Mapping              │   │
│  │ World building and      │   │
│  │ level design            │   │
│  │ 12 articles        ───► │   │
│  └─────────────────────────┘   │
│                                 │
│  MAPPING                        │  ← Future section
│  Coming soon...                 │
│                                 │
└─────────────────────────────────┘
```

---

### 7. AUTH SCREEN

```
┌─────────────────────────────────┐
│  ◄                              │
├─────────────────────────────────┤
│                                 │
│         DYSTOPIAN               │  ← Logo/branding
│           WIKI                  │
│                                 │
│  ┌────────────┬────────────┐   │
│  │  SIGN IN   │  SIGN UP   │   │  ← Tab toggle
│  └────────────┴────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📧 Email                 │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 🔑 Password          👁️ │   │  ← Show/hide toggle
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │       SIGN IN           │   │  ← Primary button (accent)
│  └─────────────────────────┘   │
│                                 │
│       Forgot password?          │  ← Link
│                                 │
│  ─────── or continue with ───── │
│                                 │
│  ┌───────────┐ ┌───────────┐   │
│  │  Discord  │ │  Google   │   │  ← OAuth buttons
│  └───────────┘ └───────────┘   │
│                                 │
│  By signing in, you agree to   │
│  our Terms and Privacy Policy  │  ← Legal links
│                                 │
└─────────────────────────────────┘
```

---

## Component Specifications

### Cards

```
┌─────────────────────────────────┐
│                                 │   Background: Navy 800
│  Card Title                     │   Border: 1px Navy 700
│  Description text that can      │   Border-radius: 12px
│  wrap to multiple lines...      │   Padding: 16px
│                                 │   Shadow: subtle (elevation 2)
│  ▪️ Meta · Info                 │
│                                 │
└─────────────────────────────────┘

Pressed state: Scale 0.98, darker background
```

### Buttons

```
PRIMARY (Accent)
┌─────────────────────────────────┐
│          BUTTON TEXT            │   Background: Accent 500
└─────────────────────────────────┘   Text: White, Bold
                                      Border-radius: 8px
                                      Height: 48px (touch target)
                                      Pressed: Accent 600

SECONDARY (Outline)
┌─────────────────────────────────┐
│          BUTTON TEXT            │   Background: Transparent
└─────────────────────────────────┘   Border: 1px Accent 500
                                      Text: Accent 400
                                      Pressed: 10% accent overlay

GHOST (Text only)
          BUTTON TEXT                 Background: Transparent
                                      Text: Accent 400
                                      Pressed: 5% white overlay
```

### Difficulty Badges

```
▪️ Beginner     →  Green dot (#4ade80)
▪️ Intermediate →  Yellow dot (#fbbf24)
▪️ Advanced     →  Red dot (#ff6b6b)

Displayed as: colored dot + text, not filled badge
(Less visual noise, more elegant)
```

### Input Fields

```
┌─────────────────────────────────┐
│ 🔍 Placeholder text...          │   Background: Navy 900
└─────────────────────────────────┘   Border: 1px Navy 700
                                      Border-radius: 8px
                                      Height: 44px
                                      Padding: 0 16px

Focused: Border → Accent 500, subtle glow
Error: Border → Error red, shake animation
```

---

## Micro-Interactions & Animations

### Motion Principle
"Fast + quiet" - Animations confirm actions, never delay reading. A wiki is a utility - speed matters.

### Page Transitions (Tightened)
- **Push**: Slide from right (240ms ease-out) ← was 300ms
- **Pop**: Slide to right (200ms ease-in) ← was 250ms
- **Modal**: Slide from bottom (280ms spring)
- **Tab switch**: Cross-fade (120ms)

### Touch Feedback (Tightened)
- **Cards**: Scale to 0.98 on press (80ms) ← was 100ms
- **Buttons**: Darken background (instant)
- **List items**: Highlight row (100ms) ← was 150ms
- **Tab bar icons**: Slight scale + color change

### Haptic Feedback (Mobile-Native Polish)
Use `expo-haptics` for tactile confirmation:
- **Light**: Tab switches, filter chip selection, toggle switches
- **Medium**: Bookmark add/remove, copy code button, download complete
- **Heavy**: Only AFTER confirmed destructive action completes (not on confirmation dialog)

*v2 refinement: Heavy haptics on the dialog itself is jarring. Reserve for confirming "action done."*

### Loading States
- **Skeleton screens**: Shimmer animation (1.5s loop), static gray in reduced motion
- **Pull to refresh**: Custom spinner with orange accent
- **Inline loading**: Pulsing dots (static dots in reduced motion)

### Success/Error Feedback
- **Success**: Brief green checkmark toast (2s) + light haptic
- **Error**: Shake animation + red border + medium haptic (no shake in reduced motion)
- **Bookmark added**: Icon pulse + "Saved!" toast

### Reduced Motion Support (v2 addition)
When system reduced motion is enabled:
- Disable shimmer → use static skeleton gray
- Disable pulse animations
- Keep only essential fades (opacity transitions)
- Page transitions: instant cut or very short fade (80ms)
- No scale animations on press

### Scroll Behaviors (Simplified - Pick 2, Not 3)
- ~~**Header shrink**~~: Dropped - adds complexity without major benefit
- **FAB**: Hide on scroll down, show on scroll up ✓
- **TOC**: Sticky, highlight active section ✓

**Why drop header shrink:** Stacking shrink + FAB + sticky TOC creates interaction overload. FAB and TOC provide more value for a wiki app.

### Offline States (Explicit UI)
- **Offline badge**: Subtle indicator in header when no connection
- **Download CTA**: "📥 Download for offline" on article header
- **Unavailable content**: "This page isn't downloaded yet" with download button
- **Sync status**: Background sync indicator in Saved tab

---

## Offline UX Specification

### Core Principles
1. **Explicit over implicit** - Users should always know what's downloaded
2. **Progressive enhancement** - App works fully offline for downloaded content
3. **Non-destructive** - Never lose user data (bookmarks, progress) when offline

### Download States

#### Article States
```
STATE           ICON    DESCRIPTION
─────────────────────────────────────────────────────────
Not downloaded  ☁️      Article available online only
Downloading     ⏳      Currently downloading (show progress)
Downloaded      📥      Available offline
Outdated        🔄      New version available online
Download failed ⚠️      Retry available
```

#### Visual Indicators in Lists
```
┌─────────────────────────────────┐
│ Lua Event Hooks                 │
│ ▪️ Intermediate · Lua API       │
│                            📥   │  ← Downloaded indicator (subtle)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Custom Events                   │
│ ▪️ Advanced · Lua API           │
│                            ☁️   │  ← Online only (shown when offline)
└─────────────────────────────────┘
```

### Download Actions

#### Single Article Download
Location: Article header
```
┌─────────────────────────────────┐
│  Creating Custom Items          │
│  ▪️ Beginner · 8 min read       │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 📥 Download for offline   │ │  ← Primary CTA when not downloaded
│  └───────────────────────────┘ │
│  OR                             │
│  ┌───────────────────────────┐ │
│  │ ✓ Downloaded · Remove     │ │  ← When already downloaded
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

#### Bulk Download (Category)
Location: Category header, Profile settings
```
┌─────────────────────────────────┐
│  LUA API                        │
│  32 articles                    │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 📥 Download all (12 MB)   │ │  ← Size estimate
│  └───────────────────────────┘ │
│  OR                             │
│  ┌───────────────────────────┐ │
│  │ ✓ 28/32 downloaded        │ │  ← Progress indicator
│  │ [Download remaining]      │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### Storage Management

Location: Profile → Settings → Storage

```
┌─────────────────────────────────┐
│  OFFLINE STORAGE                │
│                                 │
│  Used: 45 MB of ~200 MB        │
│  ████████████░░░░░░░░ 23%      │
│                                 │
│  DOWNLOADED CONTENT             │
│  ┌─────────────────────────┐   │
│  │ 🧟 Project Zomboid       │   │
│  │ 42 articles · 38 MB     │   │
│  │               [Manage]  │   │  ← Opens breakdown
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ ⛏️ Vintage Story         │   │
│  │ 12 articles · 7 MB      │   │
│  │               [Manage]  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🗑️ Clear all downloads   │   │  ← Destructive, confirm first
│  └─────────────────────────┘   │
│                                 │
│  Auto-download bookmarks: [ON] │  ← Toggle setting
│  Download over WiFi only: [ON] │
└─────────────────────────────────┘
```

### Offline Mode Behaviors

#### Header Indicator
When device is offline, show subtle indicator:
```
┌─────────────────────────────────┐
│  DYSTOPIAN WIKI      [📶 ✕]    │  ← Offline badge in header
├─────────────────────────────────┤
```

#### Navigation When Offline
- **Downloaded content**: Opens normally
- **Not downloaded**: Shows placeholder with download option

```
┌─────────────────────────────────┐
│                                 │
│         ☁️                      │
│                                 │
│  This article isn't            │
│  downloaded yet                 │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Connect to download       │ │  ← Disabled when offline
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ ◄ Go back                 │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

#### Lists When Offline
- Show all items but indicate download status
- Filter option: "Show downloaded only"
- Non-downloaded items are tappable but show placeholder

### Sync & Updates

#### Background Sync
- Check for updates when app opens (if online)
- Show badge count for outdated articles
- Never auto-update without user consent (preserves offline state)

#### Update Flow
```
┌─────────────────────────────────┐
│  Lua Event Hooks                │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 🔄 Update available       │ │  ← Appears when new version exists
│  │ Last downloaded: 3 days ago│ │
│  │ [Update now]              │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

#### Conflict Resolution
If user edits bookmarks/progress while offline:
1. **Local-first**: Changes saved locally immediately
2. **Sync on reconnect**: Queue changes for server sync
3. **Conflict**: Server wins for content, local wins for user data (bookmarks, progress)

### Empty States

#### No Downloads
```
┌─────────────────────────────────┐
│                                 │
│         📥                      │
│                                 │
│  No offline content yet        │
│                                 │
│  Download articles to read     │
│  them without internet.        │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Browse articles           │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

#### Offline + No Downloads
```
┌─────────────────────────────────┐
│                                 │
│         📶 ✕                    │
│                                 │
│  You're offline                │
│                                 │
│  Connect to the internet to    │
│  browse articles, or download  │
│  content for offline reading.  │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Open Settings             │ │  ← Deep link to WiFi settings
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Technical Implementation Notes

**Storage Architecture (v2 revision):**
- **Metadata**: AsyncStorage for small data (download status, timestamps, preferences)
- **Article content**: FileSystem (expo-file-system) as plain markdown + JSON metadata
- **Images**: Separate cached files (NOT base64 - avoids 33% size bloat)
- **Search index**: SQLite FTS for offline search (recommended if growth expected)
  - Alternative for small apps: JSON index in AsyncStorage

*v2 change: Removed base64 images recommendation - separate files are more efficient.*

**Size Estimates:**
- Average article: ~50KB (text + metadata)
- With images: ~200KB (separate files)
- Full category (30 articles): ~6-15MB

**Download Priority:**
1. Article text/markdown (fastest to useful)
2. Article metadata (TOC, related articles)
3. Images (progressive, can show placeholders)

### Cache Eviction Rules (v2 addition)

**User data (NEVER auto-evict):**
- Bookmarks
- Reading progress
- Preferences
- Downloaded articles that are bookmarked

**Content eviction:**
- Never evict bookmarked articles unless user explicitly removes
- "Clear all downloads" requires explicit confirmation
- Optional setting: "Auto-clean non-bookmarked articles after X days" (OFF by default)
- When storage full: prompt user to manage, never auto-delete

**Update Rules:**
- Detect outdated via `updatedAt` timestamp + content checksum
- Server wins for content, local wins for user state
- Never auto-update downloaded content without user consent
- Optional: "Auto-update over WiFi only" setting

---

## Accessibility Considerations

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Color Contrast**: WCAG AA minimum (4.5:1 for text, validated across surfaces)
3. **Font Scaling**: Support up to 200% text size, tested at all sizes
4. **Reduced Motion**: Respect system preference, use static alternatives
5. **Screen Reader**:
   - Proper labels on all interactive elements
   - Logical focus order
   - TOC is navigable list
   - Download state announced ("Downloaded", "Online only", "Outdated")
6. **Not Color-Only**: Status dots must include text labels (difficulty, download state)
7. **Focus Indicators**: Visible focus.ring on all interactive elements for keyboard/switch users

---

## Implementation Priority (v2 Reordered)

*v2 insight: Build tokens and primitives BEFORE screens to avoid hardcoded values.*

### Phase 0: Foundations (NEW - Do First)
1. Implement design tokens in theme/index.ts:
   - Color ramps (navy, accent)
   - Semantic tokens (bg, text, border, status)
   - Spacing scale (4pt base)
   - Border radius scale
   - Elevation/shadow tokens
2. Implement primitive components:
   - Text (with semantic variants)
   - Surface (bg + border + radius)
   - Divider
   - Button (primary/secondary/ghost)
3. Add reduced motion setting detection
4. Set up expo-haptics wrapper with usage policy

### Phase 1: Navigation Skeleton
1. Add `@react-navigation/bottom-tabs` dependency
2. Create bottom tab navigator with 4 tabs (Home, Search, Saved, Profile)
3. Nest stack navigators within tabs for drill-down screens
4. Update header styling with tokens
5. Configure deep linking in app.json

### Phase 2: Core Features
1. **Search** (most used feature):
   - Filter chips with proper states
   - Search ranking implementation
   - Match highlighting
   - Empty/no results states
2. **Article Renderer**:
   - TOC with scroll sync
   - Code blocks with copy button
   - Tables as scrollable cards
   - Internal/external link handling
   - Image lightbox

### Phase 3: Offline MVP
1. Download states UI (icons, indicators)
2. Storage management screen
3. Article download/remove functionality
4. Saved tab with "Downloaded only" filter
5. Offline detection + header indicator
6. SQLite FTS index for offline search (if scale needed)

### Phase 4: Polish
1. Haptics wrapper (light/medium/heavy policy)
2. Toast notifications
3. Skeleton loading states (respect reduced motion)
4. Touch feedback (scale, highlights)
5. Page transitions (240ms/200ms/280ms)

### Phase 5: Enhancements (Post-v1.0)
1. Reading modes (Focus/Night)
2. Bulk download at category/game level
3. Reading progress tracking
4. Related articles carousel
5. Game context persistence

---

## Files to Modify

```
packages/mobile/src/
├── theme/
│   └── index.ts              ← Semantic tokens, navy colors
├── navigation/
│   ├── index.tsx             ← Bottom tabs + nested stacks
│   ├── types.ts              ← Updated param lists
│   └── TabBar.tsx            ← Custom tab bar (optional)
├── screens/
│   ├── HomeScreen.tsx        ← Bento layout
│   ├── ArticleScreen.tsx     ← TOC, floating nav
│   ├── SearchScreen.tsx      ← Filter chips (now tab)
│   ├── BookmarksScreen.tsx   ← Tabs, progress (now "Saved" tab)
│   ├── ProfileScreen.tsx     ← Stats, settings (now tab)
│   ├── CategoriesScreen.tsx  ← Keep as stack screen
│   └── AuthScreen.tsx        ← Modal presentation
├── components/               ← NEW: Reusable components
│   ├── BentoCard.tsx
│   ├── FilterChip.tsx
│   ├── Button.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   └── OfflineBadge.tsx
└── hooks/
    └── useHaptics.ts         ← Haptic feedback wrapper
```

---

## Verification

After implementing:
1. Run app on Android emulator/device
2. Compare screens against ASCII mockups
3. Test all touch interactions
4. Verify accessibility with TalkBack
5. Check performance (60fps scrolling)
6. Test offline mode
7. Test at 200% font scale
8. Test with reduced motion enabled
9. Verify all contrast ratios with accessibility tools

---

## Change Log (v3 Final)

### What v3 Keeps from v1
- ✅ All ASCII mockups for every screen (visual reference is essential)
- ✅ Complete color ramp hex values inline (self-contained spec)
- ✅ Component specifications (buttons, cards, inputs)
- ✅ Filter chip states (default, selected, multi-selected)
- ✅ Empty state mockups
- ✅ Rationale explanations for non-obvious decisions
- ✅ Bottom tab navigation structure
- ✅ Bento layout details for Home screen
- ✅ Motion timing table

### What v3 Adds from v2
- ✅ Off-white text.primary (#f1f5f9) for reading comfort
- ✅ Contrast validation across bg.surface1 and bg.surface2
- ✅ Additional tokens: spacing, radius, elevation, focus.ring, divider
- ✅ Reading specifications (line-height, paragraph spacing)
- ✅ Game context rules (persistent scope awareness)
- ✅ Deep linking requirements
- ✅ Search ranking rules + match highlighting
- ✅ Markdown renderer rules (TOC, code copy, tables, links, images)
- ✅ Haptics policy refinement (heavy only after confirmed completion)
- ✅ Reduced motion support details
- ✅ Offline search indexing (SQLite FTS recommendation)
- ✅ Cache eviction rules
- ✅ Concrete accessibility requirements (not color-only, SR behavior)
- ✅ Implementation phases reordered (tokens first)
- ✅ Storage architecture revision (no base64 images)

### What v3 Removes/Changes from v2
- ❌ "Arcade" reading mode (YAGNI - two modes sufficient)
- ❌ Verbose prose without visuals (kept ASCII mockups)
- ❌ Cross-reference requirement (spec is self-contained)
- ⚠️ About/Discord in Home footer → mentioned as optional, not core spec

### Summary
**v3 = v1 visual completeness + v2 technical rigor**
