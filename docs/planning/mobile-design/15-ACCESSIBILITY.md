# Mobile Design: Accessibility

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: Accessibility Considerations

## Requirements Summary

| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG AA minimum (4.5:1 for text) |
| Touch targets | 44x44px minimum |
| Font scaling | Support up to 200% |
| Motion | Respect reduced motion preference |
| Screen readers | Full support with proper labels |

---

## Touch Targets

**Minimum size:** 44x44px for all interactive elements

Applies to:
- Buttons
- Links
- Cards
- Toggle switches
- Tab bar icons
- Checkbox/radio buttons

**Exception:** Inline text links can be smaller but should have adequate padding.

---

## Color Contrast

All text must meet WCAG AA standards.

### Verified Combinations

| Background | Text | Ratio | Status |
|------------|------|-------|--------|
| bg.base (#0a1628) | text.primary (#f1f5f9) | 14.8:1 | ✓ AAA |
| bg.base (#0a1628) | text.secondary (#94a3b8) | 7.2:1 | ✓ AA |
| bg.base (#0a1628) | text.muted (#64748b) | 4.7:1 | ✓ AA large |
| bg.surface1 (#0f1f35) | text.primary (#f1f5f9) | 13.2:1 | ✓ AAA |
| bg.surface2 (#1e3a5f) | text.muted (#64748b) | 3.1:1 | ⚠️ Avoid small text |

**Rule:** Avoid `text.muted` for small text on `bg.surface2`.

---

## Font Scaling

| Setting | Value |
|---------|-------|
| Minimum body | 16sp |
| Maximum tested | 200% (32sp) |

### Requirements

- All containers must handle text reflow
- Never truncate body text (excerpts allowed in lists)
- Test at 100%, 150%, and 200% scale
- Buttons and inputs must remain usable at all sizes

---

## Reduced Motion

Respect system preference via `useReducedMotion()`.

### When Enabled

| Normal | Reduced Motion |
|--------|----------------|
| Shimmer animation | Static skeleton gray |
| Pulse animations | Disabled |
| Scale on press | Disabled |
| Page transitions | Instant cut or 80ms fade |
| Shake animation | Disabled |

**Keep:** Essential opacity transitions only.

---

## Screen Reader Support

### Labels

Every interactive element must have an accessible label:

```typescript
<Pressable
  accessibilityLabel="Bookmark article"
  accessibilityRole="button"
  accessibilityState={{ selected: isBookmarked }}
>
```

### Focus Order

Logical tab order that follows visual layout:
1. Header elements (back, title, bookmark)
2. Article content (sequential)
3. Related articles
4. Floating action bar

### Announcements

| Action | Announcement |
|--------|--------------|
| Bookmark added | "Article saved to bookmarks" |
| Download complete | "Article downloaded for offline reading" |
| Error | "Error: [message]" |

### TOC Navigation

Table of Contents must be navigable as a list:

```typescript
<FlatList
  accessibilityRole="list"
  accessibilityLabel="Table of contents"
>
  {sections.map(section => (
    <Pressable accessibilityRole="listitem">
      {section.title}
    </Pressable>
  ))}
</FlatList>
```

---

## Not Color-Only Indicators

Status must never rely on color alone.

### Difficulty Badges

```
✓ Correct:  ▪️ Beginner    (dot + text)
✗ Wrong:    ▪️              (dot only)
```

### Download Status

```
✓ Correct:  📥 Downloaded
✗ Wrong:    📥              (icon only)
```

### Error States

```
✓ Correct:  Red border + error icon + message
✗ Wrong:    Red border only
```

---

## Focus Indicators

Visible focus ring on all interactive elements:

```
Token: focus.ring
Value: accent.400 @ 50%
```

Essential for keyboard and switch control users.

---

## Testing Checklist

- [ ] VoiceOver (iOS) / TalkBack (Android) navigation works
- [ ] All interactive elements have labels
- [ ] Logical focus order
- [ ] Color contrast verified with tools
- [ ] App usable at 200% font scale
- [ ] Reduced motion setting respected
- [ ] No information conveyed by color alone

---

*See also: [Color System](02-COLOR-SYSTEM.md), [Components](12-COMPONENTS.md)*
