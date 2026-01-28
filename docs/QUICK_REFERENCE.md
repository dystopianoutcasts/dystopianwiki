# Dystopian Wiki - Quick Reference Card

**Last Updated:** January 28, 2026

---

## Project Status

| Component | Status | Progress |
|-----------|--------|----------|
| Web App | ✅ Production | Auth, Bookmarks, Settings complete |
| Mobile - Phase 0 | ✅ Complete | Design system + Components |
| Mobile - Phase 1 | ✅ Complete | Navigation + 8 screens |
| Mobile - Phase 2 | 🔄 Next | Search + Article renderer |
| Mobile - Phase 3 | 📋 Planned | Offline functionality |

---

## Quick Start

```bash
# Install everything
npm install

# Web dev
cd packages/web && npm run dev
# → http://localhost:5173

# Mobile dev
cd packages/mobile && npm start
# → Press 'a' for Android, 'i' for iOS
```

---

## Project Structure

```
dystopianwiki/
├── packages/
│   ├── mobile/    # React Native (Expo)
│   ├── web/       # React (Vite)
│   └── shared/    # Types + Services
├── supabase/      # Database migrations
└── docs/          # Documentation
```

---

## Key Files

| File | What It Does |
|------|--------------|
| `packages/mobile/src/theme/index.ts` | **Design system** - All tokens |
| `packages/mobile/src/navigation/index.tsx` | Bottom tabs + navigation |
| `packages/shared/services/ApiService.ts` | Database operations |
| `docs/planning/MOBILE_UI_DESIGN_SYSTEM_V3.md` | Complete design spec |
| `docs/HANDOFF.md` | Full project documentation |

---

## Tech Stack

- **Frontend**: React, React Native (Expo), TypeScript
- **Navigation**: React Navigation v6 (Bottom Tabs + Stack)
- **State**: React Query + Context
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: CSS Modules (web), StyleSheet (mobile)

---

## Design Tokens (Mobile)

### Colors
```typescript
// Backgrounds
bg.base      #0a1628  // Navy base
bg.surface1  #0f1f35  // Cards
bg.surface2  #1e3a5f  // Hover

// Text
text.primary    #f1f5f9  // Off-white
text.secondary  #94a3b8  // Blue-tinted
text.muted      #64748b  // Disabled

// Accent
accent.default  #d4782c  // Orange brand
accent.hover    #e08940
accent.pressed  #c96820
```

### Spacing (4pt grid)
```typescript
spacing[4]  16px  // Standard padding
spacing[6]  24px  // Large gaps
spacing[8]  48px  // Major sections
```

### Typography
```typescript
h1    28sp, 1.2 line-height  // Article titles
body  16sp, 1.5 line-height  // Body text
code  14sp, 1.6 line-height  // Code blocks
```

---

## Mobile Components

| Component | Use Case |
|-----------|----------|
| `Text` | Semantic text (primary/secondary/muted) |
| `Surface` | Background containers |
| `Button` | Primary/secondary/ghost variants |
| `FilterChip` | Multi-select filters |
| `BentoCard` | Variable-size grid cards |
| `Skeleton` | Loading states |
| `Divider` | List separators |

**Import:** `import { Text, Button } from '@/components'`

---

## Mobile Screens

| Screen | Route | Status |
|--------|-------|--------|
| Home | `/` | ✅ Bento layout |
| Article | `/article/:slug` | ✅ With TOC |
| Search | `/search` | ✅ With filters |
| Bookmarks | `/bookmarks` | ✅ With progress |
| Profile | `/profile` | ✅ Stats + settings |
| Categories | `/categories` | ✅ Browse |
| Auth | `/auth` | ✅ Sign in/up |

---

## Database Schema

### Key Tables
- `articles` - Article content and metadata
- `user_profiles` - User information
- `bookmarks` - Saved articles
- `reading_progress` - Read positions

### RLS Policies
- Users can only read their own bookmarks
- Users can only update their own profile
- Articles are publicly readable

---

## API Service

### Common Operations
```typescript
import { ApiService } from '@shared/services'

// Articles
await ApiService.getArticles()
await ApiService.getArticleBySlug('lua-basics')

// Bookmarks
await ApiService.getBookmarks(userId)
await ApiService.addBookmark(userId, articleId)
await ApiService.removeBookmark(userId, articleId)

// User
await ApiService.getUserProfile(userId)
```

---

## Development Checklist

### Starting New Feature
- [ ] Check design system in `theme/index.ts`
- [ ] Use semantic tokens (not hardcoded colors)
- [ ] Follow 44px minimum touch targets
- [ ] Support reduced motion
- [ ] Add TypeScript types
- [ ] Test on Android and iOS

### Before Committing
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] No console warnings
- [ ] Accessible (WCAG AA)
- [ ] Works with 200% text scaling
- [ ] Tested on both platforms

---

## Common Tasks

### Add New Screen
1. Create component in `packages/mobile/src/screens/`
2. Add route to navigation (`navigation/index.tsx`)
3. Add TypeScript types to `navigation/types.ts`
4. Use design tokens from `theme/index.ts`

### Add New Component
1. Create in `packages/mobile/src/components/`
2. Use semantic tokens
3. Export from `components/index.ts`
4. Follow accessibility guidelines

### Update Design Token
1. Edit `packages/mobile/src/theme/index.ts`
2. Token propagates to all components automatically
3. No hardcoded values needed

---

## Troubleshooting

### Mobile App Won't Start
```bash
cd packages/mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### TypeScript Errors
```bash
# From root
npm run type-check
```

### Supabase Connection Failed
- Check `.env` file has correct credentials
- Verify Supabase project is not paused
- Check network connection

---

## Next Steps (Priority Order)

1. **Wire up Search** - Connect SearchService to SearchScreen
2. **Article Renderer** - Implement markdown with TOC, code blocks
3. **API Integration** - Connect mobile to Supabase
4. **Offline Downloads** - Implement storage + download UI
5. **Polish** - Haptics, animations, toasts

---

## Resources

- **Full Handoff**: [HANDOFF.md](HANDOFF.md)
- **Design Spec**: [MOBILE_UI_DESIGN_SYSTEM_V3.md](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md)
- **Phase 2 Status**: [phase2-complete.md](archive/phase2-complete.md)

---

## Git Workflow

```bash
# Start feature
git checkout -b feature/search-implementation

# Commit
git add .
git commit -m "feat: Add search filter functionality"

# Push
git push origin feature/search-implementation
```

### Commit Prefixes
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code restructure
- `style:` Formatting
- `test:` Tests
- `chore:` Maintenance

---

## Support

- **Docs**: `docs/` directory
- **Issues**: GitHub Issues
- **Community**: Discord (Dystopian Outcasts)

---

**Version:** 1.2 (Mobile Phase 1 Complete)
