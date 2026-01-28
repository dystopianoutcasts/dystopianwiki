# Mobile Design: Component Specifications

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Component Specifications

## Cards

### Standard Card

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
```

### Card States

| State | Style |
|-------|-------|
| Default | Navy 800 bg, Navy 700 border |
| Pressed | Scale 0.98, darker background |
| Disabled | 50% opacity |

---

## Buttons

### Primary Button (Accent)

```
┌─────────────────────────────────┐
│          BUTTON TEXT            │
└─────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | Accent 500 |
| Text | White, Bold |
| Border-radius | 8px |
| Height | 48px (touch target) |
| Pressed | Accent 600 |

### Secondary Button (Outline)

```
┌─────────────────────────────────┐
│          BUTTON TEXT            │
└─────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | Transparent |
| Border | 1px Accent 500 |
| Text | Accent 400 |
| Pressed | 10% accent overlay |

### Ghost Button (Text only)

```
          BUTTON TEXT
```

| Property | Value |
|----------|-------|
| Background | Transparent |
| Text | Accent 400 |
| Pressed | 5% white overlay |

---

## Difficulty Badges

```
▪️ Beginner     →  Green dot (#4ade80)
▪️ Intermediate →  Yellow dot (#fbbf24)
▪️ Advanced     →  Red dot (#ff6b6b)
```

**Display format:** Colored dot + text label (not filled badge)

*Rationale: Less visual noise, more elegant.*

**Important:** Never use color alone. Always include text label for accessibility.

---

## Input Fields

### Default State

```
┌─────────────────────────────────┐
│ 🔍 Placeholder text...          │
└─────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | Navy 900 |
| Border | 1px Navy 700 |
| Border-radius | 8px |
| Height | 44px |
| Padding | 0 16px |

### Focused State

| Property | Value |
|----------|-------|
| Border | Accent 500 |
| Effect | Subtle glow |

### Error State

| Property | Value |
|----------|-------|
| Border | Error red |
| Animation | Shake (unless reduced motion) |

---

## Filter Chips

### Default

```
┌───────────┐
│  All      │   Background: Navy 800
└───────────┘   Text: text.secondary
```

### Selected (Single-Select)

```
┌───────────┐
│  Guides   │   Background: Accent 500
└───────────┘   Text: text.primary
```

### Selected (Multi-Select)

```
┌───────────┐
│  API      │   Background: accent.muted (10%)
└───────────┘   Border: Accent 500 outline
                Text: Accent 400
```

---

## Toggle Switch

```
OFF: [○────────]   Track: Navy 700
ON:  [────────●]   Track: Accent 500
                   Thumb: White
```

---

## Progress Bar

```
████████░░░░ 65%
```

| Property | Value |
|----------|-------|
| Track | Navy 700 |
| Fill | Accent 500 |
| Height | 4px |
| Border-radius | 2px |

---

## Avatar

```
┌─────────┐
│    E    │   Circle shape
└─────────┘   Background: Accent 500
              Text: White, Bold
              Size: 48px default
```

With image: Circle-cropped user photo.

---

## Divider

```
─────────────────────────────
```

| Property | Value |
|----------|-------|
| Color | navy.700 @ 50% |
| Height | 1px |
| Margin | 16px vertical |

---

## Toast Notification

```
┌─────────────────────────────────┐
│ ✓ Saved to bookmarks            │
└─────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | Navy 800 |
| Border | 1px Navy 600 |
| Duration | 2 seconds |
| Position | Bottom, above tab bar |

---

## Skeleton Loading

```
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░            │   Shimmer animation
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   1.5s loop
│ ░░░░░░░░░░░░                    │
└─────────────────────────────────┘
```

**Reduced motion:** Static gray, no shimmer.

---

*See also: [Color System](02-COLOR-SYSTEM.md), [Animations](13-ANIMATIONS.md)*
