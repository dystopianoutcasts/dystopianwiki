# Mobile Design: Animations & Micro-Interactions

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Micro-Interactions & Animations

## Motion Principle

**"Fast + quiet"** - Animations confirm actions, never delay reading. A wiki is a utility - speed matters.

---

## Page Transitions

| Transition | Animation | Duration |
|------------|-----------|----------|
| Push (drill-down) | Slide from right | 240ms ease-out |
| Pop (back) | Slide to right | 200ms ease-in |
| Modal | Slide from bottom | 280ms spring |
| Tab switch | Cross-fade | 120ms |

---

## Touch Feedback

| Element | Animation | Duration |
|---------|-----------|----------|
| Cards | Scale to 0.98 | 80ms |
| Buttons | Darken background | instant |
| List items | Highlight row | 100ms |
| Tab bar icons | Slight scale + color change | 100ms |

---

## Haptic Feedback

Use `expo-haptics` for tactile confirmation.

### Light Haptic

- Tab switches
- Filter chip selection
- Toggle switches

### Medium Haptic

- Bookmark add/remove
- Copy code button
- Download complete

### Heavy Haptic

**Only AFTER confirmed destructive action completes** (not on confirmation dialog)

*v2 refinement: Heavy haptics on the dialog itself is jarring. Reserve for confirming "action done."*

---

## Loading States

### Skeleton Screens

```
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░            │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░                    │
└─────────────────────────────────┘
```

- Shimmer animation (1.5s loop)
- Static gray in reduced motion mode

### Pull to Refresh

- Custom spinner with orange accent
- Spring animation on release

### Inline Loading

- Pulsing dots
- Static dots in reduced motion mode

---

## Success/Error Feedback

### Success

- Brief green checkmark toast (2s)
- Light haptic

### Error

- Shake animation + red border
- Medium haptic
- No shake in reduced motion mode

### Bookmark Added

- Icon pulse animation
- "Saved!" toast
- Medium haptic

---

## Reduced Motion Support

When system reduced motion is enabled:

| Normal | Reduced Motion |
|--------|----------------|
| Shimmer animation | Static skeleton gray |
| Pulse animations | Disabled |
| Scale on press | Disabled |
| Page transitions | Instant cut or 80ms fade |
| Shake animation | Disabled |

**Keep only:** Essential opacity transitions (fades)

---

## Scroll Behaviors

### What's Included

| Feature | Description |
|---------|-------------|
| FAB | Hide on scroll down, show on scroll up |
| TOC | Sticky, highlight active section |

### What's Excluded

~~Header shrink~~ - Dropped to reduce interaction complexity.

*Rationale: Stacking shrink + FAB + sticky TOC creates interaction overload. FAB and TOC provide more value for a wiki app.*

---

## Offline State Indicators

| State | Visual |
|-------|--------|
| Offline badge | Subtle indicator in header when no connection |
| Download CTA | "📥 Download for offline" on article header |
| Unavailable content | "This page isn't downloaded yet" with download button |
| Sync status | Background sync indicator in Saved tab |

---

## Animation Timing Reference

```
ELEMENT              DURATION    EASING
─────────────────────────────────────────────
Push transition      240ms       ease-out
Pop transition       200ms       ease-in
Modal appear         280ms       spring
Tab switch           120ms       linear
Card press           80ms        ease-out
List highlight       100ms       ease-in-out
Toast appear         200ms       ease-out
Toast dismiss        150ms       ease-in
Skeleton shimmer     1500ms      linear (loop)
```

---

## Implementation Notes

### Haptics Wrapper

Create a `useHaptics` hook that:
1. Checks if haptics are available
2. Respects system settings
3. Provides consistent API: `haptics.light()`, `haptics.medium()`, `haptics.heavy()`

### Reduced Motion Detection

```typescript
import { useReducedMotion } from 'react-native-reanimated';

const reducedMotion = useReducedMotion();
```

Use this to conditionally disable animations.

---

*See also: [Components](12-COMPONENTS.md), [Implementation](16-IMPLEMENTATION.md)*
