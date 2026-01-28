# Mobile Design: Typography

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Typography (Readability-First)

## Critical Insight

A wiki is 90% long-form reading. Brand expression must not compromise readability.

---

## Font Usage

| Usage | Font | Rationale |
|-------|------|-----------|
| App name/logo | Russo One | Brand moments only |
| Section headers | Russo One (optional) | Dystopian identity |
| H1 article titles | Russo One | Hero treatment |
| Body text | System default | Maximum readability |
| UI elements | System default | Native feel |
| Code blocks | JetBrains Mono | Developer standard |

### Why System Fonts for Body

- Optimized for each platform (San Francisco on iOS, Roboto on Android)
- No bundle size increase
- Users already comfortable reading them
- Respects accessibility settings

*Note: Russo One loaded via expo-font for brand moments only.*

---

## Reading Specifications

| Element | Size | Line-Height | Spacing |
|---------|------|-------------|---------|
| Body text | 16sp min | 1.5 (24px) | - |
| Paragraph spacing | - | - | 12-16px between |
| Code blocks | 14sp | 1.6 (22px) | Increased for scanning |
| Captions | 14sp | 1.4 (20px) | - |
| H1 (article) | 28sp | 1.2 | 24px below |
| H2 | 22sp | 1.3 | 20px above, 12px below |
| H3 | 18sp | 1.3 | 16px above, 8px below |

---

## Dynamic Type Support

| Setting | Value |
|---------|-------|
| Minimum body | 16sp |
| Maximum tested | 200% (32sp) |

### Requirements

- All containers must handle text reflow
- Never truncate body text (excerpts allowed in lists)
- Test at 100%, 150%, and 200% scale
- Ensure touch targets remain accessible at all sizes

---

## Heading Hierarchy

```
H1 - Article Title (Russo One, 28sp)
│
├── H2 - Major Section (22sp)
│   │
│   ├── H3 - Subsection (18sp)
│   │   │
│   │   └── Body text (16sp)
│   │
│   └── H3 - Subsection (18sp)
│
└── H2 - Major Section (22sp)
```

---

## Code Block Typography

```
Font: JetBrains Mono
Size: 14sp
Line-height: 1.6 (22px)
Background: navy.900
Border: 1px navy.700
Padding: 16px
```

Features:
- Language label in top-left
- Copy button in top-right
- Horizontal scroll for long lines
- Optional wrap toggle

---

*See also: [Screen: Article](06-SCREEN-ARTICLE.md), [Components](12-COMPONENTS.md)*
