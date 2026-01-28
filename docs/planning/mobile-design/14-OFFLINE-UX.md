# Mobile Design: Offline UX Specification

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Offline UX Specification

## Core Principles

1. **Explicit over implicit** - Users should always know what's downloaded
2. **Progressive enhancement** - App works fully offline for downloaded content
3. **Non-destructive** - Never lose user data (bookmarks, progress) when offline

---

## Download States

### Article States

| State | Icon | Description |
|-------|------|-------------|
| Not downloaded | ☁️ | Article available online only |
| Downloading | ⏳ | Currently downloading (show progress) |
| Downloaded | 📥 | Available offline |
| Outdated | 🔄 | New version available online |
| Download failed | ⚠️ | Retry available |

### Visual Indicators in Lists

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

---

## Download Actions

### Single Article Download

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

### Bulk Download (Category)

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

---

## Storage Management

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

---

## Offline Mode Behaviors

### Header Indicator

When device is offline, show subtle indicator:

```
┌─────────────────────────────────┐
│  DYSTOPIAN WIKI      [📶 ✕]    │  ← Offline badge in header
├─────────────────────────────────┤
```

### Navigation When Offline

| Content State | Behavior |
|---------------|----------|
| Downloaded | Opens normally |
| Not downloaded | Shows placeholder with download option |

### Placeholder for Non-Downloaded Content

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

### Lists When Offline

- Show all items but indicate download status
- Filter option: "Show downloaded only"
- Non-downloaded items are tappable but show placeholder

---

## Sync & Updates

### Background Sync

- Check for updates when app opens (if online)
- Show badge count for outdated articles
- Never auto-update without user consent (preserves offline state)

### Update Flow

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

### Conflict Resolution

If user edits bookmarks/progress while offline:

1. **Local-first**: Changes saved locally immediately
2. **Sync on reconnect**: Queue changes for server sync
3. **Conflict**: Server wins for content, local wins for user data (bookmarks, progress)

---

## Empty States

### No Downloads

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

### Offline + No Downloads

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

---

## Technical Implementation Notes

### Storage Architecture

| Data Type | Storage Method |
|-----------|----------------|
| Metadata | AsyncStorage (small data: download status, timestamps, preferences) |
| Article content | FileSystem (expo-file-system) as plain markdown + JSON metadata |
| Images | Separate cached files (NOT base64 - avoids 33% size bloat) |
| Search index | SQLite FTS for offline search (recommended if growth expected) |

*Alternative for small apps: JSON index in AsyncStorage.*

### Size Estimates

| Content | Size |
|---------|------|
| Average article (text + metadata) | ~50KB |
| Article with images | ~200KB |
| Full category (30 articles) | ~6-15MB |

### Download Priority

1. Article text/markdown (fastest to useful)
2. Article metadata (TOC, related articles)
3. Images (progressive, can show placeholders)

---

## Cache Eviction Rules

### User Data (NEVER auto-evict)

- Bookmarks
- Reading progress
- Preferences
- Downloaded articles that are bookmarked

### Content Eviction Rules

| Rule | Description |
|------|-------------|
| Bookmarked articles | Never evict unless user explicitly removes |
| "Clear all downloads" | Requires explicit confirmation |
| Auto-clean | Optional: "Auto-clean non-bookmarked articles after X days" (OFF by default) |
| Storage full | Prompt user to manage, never auto-delete |

### Update Rules

| Rule | Description |
|------|-------------|
| Outdated detection | Via `updatedAt` timestamp + content checksum |
| Content conflicts | Server wins for content, local wins for user state |
| Auto-update | Never without user consent |
| WiFi-only option | "Auto-update over WiFi only" setting |

---

*See also: [Screen: Bookmarks](08-SCREEN-BOOKMARKS.md), [Implementation](16-IMPLEMENTATION.md)*
