# Mobile Design: Color System & Tokens

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Brand Alignment, Color System

## Brand Alignment Note

The current mobile theme uses pure blacks (`#0a0a0a`) which differs from the web's navy-tinted dark theme. **Recommendation: Align with web's navy palette for brand consistency.**

---

## Complete Token Ramps

### Navy Scale (Backgrounds & Surfaces)

```
TOKEN       HEX         USE
────────────────────────────────────────
navy.950    #050d18     Deepest background (modals backdrop)
navy.900    #0a1628     bg.base - Primary background
navy.800    #0f1f35     bg.surface1 - Cards, elevated surfaces
navy.700    #1e3a5f     bg.surface2 - Hover states, borders
navy.600    #264a78     bg.surface3 - Active states, strong borders
navy.500    #3b6491     Interactive hover
navy.400    #5a8ab8     Disabled text, subtle icons
navy.300    #8cb3d9     Secondary text alternative
navy.200    #b8d4ee     High contrast text
navy.100    #e0eef9     Inverted backgrounds
navy.50     #f0f7fc     Light mode base (future)
```

### Orange/Accent Scale (Brand Color)

```
TOKEN       HEX         USE
────────────────────────────────────────
accent.950  #4a2008     Darkest accent (rarely used)
accent.900  #7c340d     Dark backgrounds with accent tint
accent.800  #9a4014     Strong pressed states
accent.700  #b85a1a     Pressed state
accent.600  #c96820     Active state
accent.500  #d4782c     PRIMARY - Buttons, links, CTAs
accent.400  #e08940     Hover state
accent.300  #f0a860     Light accent (text on dark)
accent.200  #f5c896     Muted accent (badges)
accent.100  #fae3c8     Very light accent
accent.50   #fef3e6     Accent tinted backgrounds
```

---

## Semantic Token Mapping

### Backgrounds

| Token | Value | Use Case |
|-------|-------|----------|
| `bg.base` | navy.900 | Main app background |
| `bg.surface1` | navy.800 | Cards, list items |
| `bg.surface2` | navy.700 | Nested cards, hovers |
| `bg.surface3` | navy.600 | Active selections |
| `bg.overlay` | navy.950 @ 80% | Modal backdrops |

### Borders & Dividers

| Token | Value | Use Case |
|-------|-------|----------|
| `border.subtle` | navy.700 | Default borders |
| `border.strong` | navy.600 | Focused/active borders |
| `border.accent` | accent.500 | Highlighted borders |
| `divider.default` | navy.700 @ 50% | List separators (lighter than border) |

### Text (Comfort-First)

| Token | Value | Use Case |
|-------|-------|----------|
| `text.primary` | #f1f5f9 | Main content (off-white for reading comfort) |
| `text.secondary` | #94a3b8 | Supporting text (blue-tinted) |
| `text.muted` | #64748b | Disabled, hints, captions |
| `text.link` | accent.400 | Links, interactive text |
| `text.inverse` | navy.900 | Text on light backgrounds |

### Accent

| Token | Value | Use Case |
|-------|-------|----------|
| `accent.default` | accent.500 | Primary actions |
| `accent.hover` | accent.400 | Hover states |
| `accent.pressed` | accent.600 | Pressed states |
| `accent.muted` | accent.300 | Subtle accent text |

### Status Colors

| Token | Value | Use Case |
|-------|-------|----------|
| `status.success` | #4ade80 | Beginner difficulty, positive feedback |
| `status.warning` | #fbbf24 | Intermediate difficulty, caution |
| `status.error` | #ff6b6b | Advanced difficulty, destructive actions |
| `status.info` | #60a5fa | Informational messages |

### Interactive

| Token | Value | Use Case |
|-------|-------|----------|
| `focus.ring` | accent.400 @ 50% | Keyboard/accessibility focus indicator |

---

## Additional Design Tokens

### Spacing (4pt base grid)

```
spacing.1    4px      Tight padding
spacing.2    8px      Small gaps
spacing.3    12px     Medium gaps
spacing.4    16px     Standard padding
spacing.5    20px     Section gaps
spacing.6    24px     Large gaps
spacing.7    32px     Section separators
spacing.8    48px     Major sections
```

### Border Radius

```
radius.sm    4px      Badges, chips
radius.md    8px      Buttons, inputs
radius.lg    12px     Cards
radius.xl    16px     Modals, sheets
radius.full  9999px   Pills, avatars
```

### Elevation (Shadows)

```
elevation.1  0 1px 2px navy.950 @ 20%     Subtle lift (chips)
elevation.2  0 2px 4px navy.950 @ 25%     Cards
elevation.3  0 4px 8px navy.950 @ 30%     Dropdowns, FAB
elevation.4  0 8px 16px navy.950 @ 35%    Modals
```

---

## Contrast Verification (WCAG AA)

### On bg.base (#0a1628)

| Token | Color | Ratio | Status |
|-------|-------|-------|--------|
| text.primary | #f1f5f9 | 14.8:1 | ✓ AAA |
| text.secondary | #94a3b8 | 7.2:1 | ✓ AA |
| text.muted | #64748b | 4.7:1 | ✓ AA large |
| accent.default | #d4782c | 5.8:1 | ✓ AA |

### On bg.surface1 (#0f1f35)

| Token | Color | Ratio | Status |
|-------|-------|-------|--------|
| text.primary | #f1f5f9 | 13.2:1 | ✓ AAA |
| text.secondary | #94a3b8 | 6.4:1 | ✓ AA |
| text.muted | #64748b | 4.2:1 | ✓ AA large |

### On bg.surface2 (#1e3a5f)

| Token | Color | Ratio | Status |
|-------|-------|-------|--------|
| text.primary | #f1f5f9 | 9.8:1 | ✓ AAA |
| text.secondary | #94a3b8 | 4.8:1 | ✓ AA |
| text.muted | #64748b | 3.1:1 | ⚠️ Avoid small text |

---

*Rationale: Off-white (#f1f5f9) reduces eye strain vs pure white during long reading sessions while maintaining excellent contrast.*

---

*See also: [Components](12-COMPONENTS.md), [Accessibility](15-ACCESSIBILITY.md)*
