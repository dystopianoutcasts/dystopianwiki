# Mobile Design: Profile Screen

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: 5. PROFILE SCREEN

## Screen Layout

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

## Sections

### User Info

| Element | Style |
|---------|-------|
| Avatar | Circle with initial or user image |
| Username | text.primary, 18sp |
| Email | text.secondary, 14sp |

### Your Stats

| Stat | Description |
|------|-------------|
| Saved | Number of bookmarked articles |
| Completed | Number of articles with 100% progress |

Stats displayed in a 2-column grid with large numbers.

### Settings

| Setting | Type | Default |
|---------|------|---------|
| Dark Mode | Toggle | ON (only mode initially) |
| Offline Mode | Toggle | ON |
| Notifications | Toggle | OFF (future feature) |

### Account Actions

| Action | Style | Behavior |
|--------|-------|----------|
| Change Email | Normal | Navigate to form |
| Change Password | Normal | Navigate to form |
| Sign Out | Red text | Confirm dialog → sign out |
| Delete Account | Destructive (separate section) | Multi-step confirmation |

### Footer

- App version: "v1.0.0"
- Attribution: "Made by Dystopian Outcasts Community"

---

## Settings Toggle Behavior

```
┌─────────────────────────────┐
│ 📱 Offline Mode       [ON]  │
└─────────────────────────────┘
         ↓ Tap toggle
┌─────────────────────────────┐
│ 📱 Offline Mode      [OFF]  │
└─────────────────────────────┘
         ↓ Light haptic feedback
```

---

## Destructive Actions

### Sign Out

1. Tap "Sign Out"
2. Show confirmation: "Are you sure you want to sign out?"
3. Confirm → Sign out + navigate to Home

### Delete Account

1. Tap "Delete Account"
2. Warning screen explaining consequences
3. Require password re-entry
4. Final confirmation
5. Delete → Navigate to Home (logged out)

---

*See also: [Screen: Auth](11-SCREEN-AUTH.md), [Offline UX](14-OFFLINE-UX.md)*
