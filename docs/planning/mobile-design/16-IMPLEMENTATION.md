# Mobile Design: Implementation Phases

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Implementation Priority, Files to Modify, Verification

## Implementation Order

*v2 insight: Build tokens and primitives BEFORE screens to avoid hardcoded values.*

---

## Phase 0: Foundations (Do First)

### 1. Design Tokens

Implement in `theme/index.ts`:
- Color ramps (navy, accent)
- Semantic tokens (bg, text, border, status)
- Spacing scale (4pt base)
- Border radius scale
- Elevation/shadow tokens

### 2. Primitive Components

- `Text` (with semantic variants)
- `Surface` (bg + border + radius)
- `Divider`
- `Button` (primary/secondary/ghost)

### 3. System Integration

- Add reduced motion setting detection
- Set up expo-haptics wrapper with usage policy

---

## Phase 1: Navigation Skeleton

1. Add `@react-navigation/bottom-tabs` dependency
2. Create bottom tab navigator with 4 tabs (Home, Search, Saved, Profile)
3. Nest stack navigators within tabs for drill-down screens
4. Update header styling with tokens
5. Configure deep linking in app.json

---

## Phase 2: Core Features

### Search (Most Used Feature)

- Filter chips with proper states
- Search ranking implementation
- Match highlighting
- Empty/no results states

### Article Renderer

- TOC with scroll sync
- Code blocks with copy button
- Tables as scrollable cards
- Internal/external link handling
- Image lightbox

---

## Phase 3: Offline MVP

1. Download states UI (icons, indicators)
2. Storage management screen
3. Article download/remove functionality
4. Saved tab with "Downloaded only" filter
5. Offline detection + header indicator
6. SQLite FTS index for offline search (if scale needed)

---

## Phase 4: Polish

1. Haptics wrapper (light/medium/heavy policy)
2. Toast notifications
3. Skeleton loading states (respect reduced motion)
4. Touch feedback (scale, highlights)
5. Page transitions (240ms/200ms/280ms)

---

## Phase 5: Enhancements (Post-v1.0)

1. Reading modes (Focus/Night)
2. Bulk download at category/game level
3. Reading progress tracking
4. Related articles carousel
5. Game context persistence

---

## File Structure

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

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@react-navigation/bottom-tabs` | Tab navigation |
| `@react-navigation/native-stack` | Stack navigation |
| `expo-haptics` | Haptic feedback |
| `expo-file-system` | Offline storage |
| `expo-font` | Russo One font |
| `react-native-reanimated` | Animations + reduced motion |
| `react-native-syntax-highlighter` | Code blocks |

---

## Verification Checklist

After implementing each phase:

### Functionality
- [ ] Run app on Android emulator/device
- [ ] Compare screens against ASCII mockups
- [ ] Test all touch interactions
- [ ] Test navigation flows

### Performance
- [ ] 60fps scrolling
- [ ] No jank on tab switches
- [ ] Fast article loading

### Accessibility
- [ ] Verify with TalkBack
- [ ] Test at 200% font scale
- [ ] Test with reduced motion enabled
- [ ] Verify contrast ratios

### Offline
- [ ] Test offline mode
- [ ] Verify download/remove works
- [ ] Check storage management

---

## Quick Reference: Token Usage

```typescript
// Colors
import { colors } from '@/theme';
backgroundColor: colors.bg.base          // #0a1628
color: colors.text.primary               // #f1f5f9
borderColor: colors.border.subtle        // navy.700

// Spacing
import { spacing } from '@/theme';
padding: spacing[4]                      // 16px
gap: spacing[2]                          // 8px

// Radius
import { radius } from '@/theme';
borderRadius: radius.lg                  // 12px

// Elevation
import { elevation } from '@/theme';
...elevation[2]                          // Card shadow
```

---

## Change Log Reference

### v3 = v1 visual completeness + v2 technical rigor

**Kept from v1:**
- All ASCII mockups
- Complete color ramp hex values
- Component specifications
- Rationale explanations

**Added from v2:**
- Off-white text for reading comfort
- Contrast validation
- Additional tokens (spacing, radius, elevation)
- Search ranking rules
- Markdown renderer rules
- Cache eviction rules
- Implementation phase reordering

---

*See also: All other spec documents in this directory*
