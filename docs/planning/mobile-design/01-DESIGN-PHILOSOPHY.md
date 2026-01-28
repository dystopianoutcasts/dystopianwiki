# Mobile Design: Philosophy & Principles

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Design Philosophy

## Design Philosophy

Mobile-native "codex companion" for a multi-game modding wiki: fast discovery, comfortable reading, offline-first reliability, AAA polish without noise.

### Design Intent

"AAA game-studio codex + encyclopedia utility" - a tool modders trust daily. Think Blizzard's in-game encyclopedias or Riot's companion apps, but for modding documentation.

## Guiding Principles

### 1. Dark-First, Eye-Friendly
Optimized for extended reading with comfort-first text colors. Off-white text (#f1f5f9) reduces eye strain vs pure white during long reading sessions.

### 2. Bottom Tab Navigation
Primary destinations within thumb reach. Standard pattern users expect. 4 tabs is optimal (5 max).

### 3. Content-First
UI gets out of the way when reading. A wiki is 90% long-form reading - brand expression must not compromise readability.

### 4. Bento Discovery
Variable card layouts for visual hierarchy on Home. Game cards, featured content, and recent articles in a scannable grid.

### 5. Micro-Interactions + Haptics
Purposeful feedback that confirms actions (not distracts). "Fast + quiet" - animations confirm actions, never delay reading.

### 6. Offline-First
Explicit download states, graceful degradation, searchable offline. Users should always know what's downloaded.

### 7. Accessibility-First
Scalable text, reduced motion support, never color-only indicators. WCAG AA minimum contrast ratios.

## Reading Modes (Phase 2 Feature)

| Mode | Description | Use Case |
|------|-------------|----------|
| **Focus** (default) | Neutral, minimal saturation, reduced motion | General reading |
| **Night** | Warmer paper-like contrast, reduced highlights | Late-night reading |

*Rationale: Two modes cover 99% of use cases. Additional modes add maintenance burden.*

## Brand Expression vs. Readability

**Where brand shows:**
- App name/logo (Russo One font)
- Section headers (Russo One optional)
- H1 article titles (Russo One)
- Accent color for interactive elements

**Where readability wins:**
- Body text (system default)
- UI elements (system default)
- Code blocks (JetBrains Mono)

---

*See also: [Typography](03-TYPOGRAPHY.md), [Color System](02-COLOR-SYSTEM.md)*
