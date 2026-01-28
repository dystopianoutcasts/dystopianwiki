# Dystopian Wiki - Project Handoff Document

**Date:** January 28, 2026
**Version:** v1.1 (Mobile App Foundation Complete)
**Status:** Active Development - Phase 1 Complete

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [What's Been Built](#whats-been-built)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
6. [Key Files & Directories](#key-files--directories)
7. [Design System](#design-system)
8. [Current Features](#current-features)
9. [What's Next](#whats-next)
10. [Known Issues & Limitations](#known-issues--limitations)
11. [Important Decisions](#important-decisions)
12. [Resources](#resources)

---

## Project Overview

**Dystopian Wiki** is a multi-game modding documentation platform with both web and mobile applications. It serves as a comprehensive knowledge base for modders working with games like Project Zomboid and Vintage Story.

### Core Mission
Provide fast, accessible, offline-capable modding documentation with AAA polish and a "codex companion" feel.

### Applications
- **Web App**: React-based wiki with authentication and article management
- **Mobile App**: React Native app optimized for discovery, reading, and offline access

---

## What's Been Built

### ✅ Web Application (Production)
- **Authentication System**
  - Email/password signup and login
  - Discord & Google OAuth integration
  - Session persistence with auto-refresh
  - Protected routes with auth guards

- **User Features**
  - User profiles with display names
  - Bookmarking system with optimistic updates
  - Reading progress tracking (backend ready)
  - Settings page for account management

- **Content Management**
  - Article browsing by game and category
  - Markdown rendering with syntax highlighting
  - Difficulty indicators (Beginner/Intermediate/Advanced)
  - Article metadata (tags, version, category)

- **Backend**
  - Supabase for authentication and database
  - Row-Level Security (RLS) policies
  - PostgreSQL with proper indexes
  - ApiService facade for all operations

### ✅ Mobile Application (In Development)

#### Phase 0: Foundations - **COMPLETE**
- **Design System v3** (Navy-tinted dark theme)
  - Complete semantic color tokens (navy & orange accent)
  - Spacing scale (4pt base grid)
  - Typography system (Russo One + System fonts)
  - Border radius, elevation, and animation tokens
  - WCAG AA accessibility compliant

- **Primitive Components** (7 components)
  - `Text` - Semantic text variants (primary/secondary/muted)
  - `Surface` - Background containers with borders
  - `Button` - Primary/secondary/ghost variants
  - `Divider` - List separators
  - `FilterChip` - Multi-select filter chips
  - `BentoCard` - Variable-size grid cards
  - `Skeleton` - Loading states with reduced motion support

#### Phase 1: Navigation - **COMPLETE**
- **Bottom Tab Navigation** (4 tabs)
  - Home, Search, Saved, Profile
  - Nested stack navigators for drill-down

- **8 Screens Implemented**
  - `HomeScreen` - Bento layout discovery with game cards
  - `ArticleScreen` - Reading view with TOC
  - `SearchScreen` - Advanced filtering (game, type, difficulty)
  - `BookmarksScreen` - Saved articles with progress tracking
  - `ProfileScreen` - User stats & settings
  - `CategoriesScreen` - Browse by category
  - `CategoryArticlesScreen` - Category drill-down
  - `AuthScreen` - Sign in/up with OAuth support

---

## Tech Stack

### Web Application
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** React Query + Context API
- **Styling:** CSS Modules
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** Static hosting ready (Vercel/Netlify)

### Mobile Application
- **Framework:** React Native (Expo)
- **TypeScript:** Strict mode enabled
- **Navigation:** React Navigation v6 (Bottom Tabs + Stack)
- **Fonts:** Russo One (brand), System fonts (readability)
- **State Management:** React Query (shared with web)
- **Backend:** Supabase (shared with web)

### Shared
- **Package Manager:** npm workspaces (monorepo)
- **Shared Code:** `packages/shared` (types, services, utilities)
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (OAuth + Email/Password)

---

## Architecture

### Monorepo Structure

```
dystopianwiki/
├── packages/
│   ├── mobile/              # React Native mobile app
│   │   ├── src/
│   │   │   ├── theme/       # Design tokens (v3 system)
│   │   │   ├── components/  # Reusable UI components (7)
│   │   │   ├── screens/     # Screen components (8)
│   │   │   ├── navigation/  # Navigation config
│   │   │   └── hooks/       # Custom React hooks
│   │   ├── assets/          # Images, fonts, icons
│   │   ├── app.json         # Expo config
│   │   └── package.json
│   │
│   ├── web/                 # React web application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── context/     # AuthContext
│   │   │   ├── hooks/       # useSupabase hooks
│   │   │   ├── pages/       # Page components
│   │   │   └── styles/      # CSS Modules
│   │   └── package.json
│   │
│   └── shared/              # Shared code between web & mobile
│       ├── services/
│       │   ├── ApiService.ts    # Database operations facade
│       │   └── SearchService.ts # Search functionality
│       ├── types/
│       │   ├── article.ts       # Article types
│       │   └── user.ts          # User, Bookmark types
│       └── package.json
│
├── supabase/
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase config
│
├── docs/
│   ├── planning/            # Design specs & planning docs
│   ├── archive/             # Phase completion docs
│   ├── guides/              # How-to guides
│   └── HANDOFF.md          # This document
│
└── package.json             # Root workspace config
```

### Data Flow

```
┌─────────────────┐
│  Mobile/Web App │
└────────┬────────┘
         │
         ├── React Query (caching)
         │
         ├── ApiService (facade)
         │
         ├── Supabase Client
         │
         └── PostgreSQL + Auth
             ├── articles table
             ├── user_profiles table
             ├── bookmarks table
             └── reading_progress table
```

### Design Pattern
- **Service Layer + Facade Pattern**
  - TypeScript interfaces as data models
  - ApiService centralizes all API operations
  - React Query handles caching and state
  - Supabase handles RLS and permissions

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Expo CLI (for mobile development)
- Supabase account (for backend)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd dystopianwiki

# Install all dependencies (monorepo)
npm install

# Set up environment variables
# Copy .env.example to .env in packages/web/
# Add your Supabase credentials
```

### Web Development

```bash
# Start web dev server
cd packages/web
npm run dev

# Web app runs at http://localhost:5173
```

### Mobile Development

```bash
# Start mobile dev server (Expo)
cd packages/mobile
npm start

# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Scan QR code for physical device
```

### Database Setup

```bash
# Run migrations (if using local Supabase)
cd supabase
supabase migration up

# Or use Supabase Studio UI to run migrations
```

---

## Key Files & Directories

### Mobile App - Core Files

| File | Purpose |
|------|---------|
| `packages/mobile/src/theme/index.ts` | **Design system v3** - All tokens (colors, spacing, typography, elevation) |
| `packages/mobile/src/navigation/index.tsx` | Navigation config - Bottom tabs + nested stacks |
| `packages/mobile/src/components/index.ts` | Component exports - 7 primitive components |
| `packages/mobile/src/screens/HomeScreen.tsx` | Home screen with bento layout |
| `packages/mobile/src/screens/ArticleScreen.tsx` | Article reader with TOC |
| `packages/mobile/src/screens/SearchScreen.tsx` | Advanced search with filters |
| `packages/mobile/app.json` | Expo configuration |

### Web App - Core Files

| File | Purpose |
|------|---------|
| `packages/web/src/context/AuthContext.tsx` | Global auth state management |
| `packages/web/src/hooks/useSupabase.ts` | React Query hooks for data fetching |
| `packages/web/src/components/auth/LoginModal.tsx` | Authentication modal |
| `packages/web/src/pages/BookmarksPage.tsx` | User bookmarks page |
| `packages/web/src/pages/SettingsPage.tsx` | User settings page |

### Shared Code

| File | Purpose |
|------|---------|
| `packages/shared/services/ApiService.ts` | Database operations facade |
| `packages/shared/services/SearchService.ts` | Search functionality |
| `packages/shared/types/article.ts` | Article type definitions |
| `packages/shared/types/user.ts` | User, Bookmark, Profile types |

### Documentation

| File | Purpose |
|------|---------|
| `docs/planning/MOBILE_UI_DESIGN_SYSTEM_V3.md` | **Complete mobile design spec** (177 pages) |
| `docs/planning/mobile-design/*.md` | Design system broken into sections |
| `docs/archive/phase2-complete.md` | Web auth system completion summary |
| `docs/CREATING_ARTICLES.md` | Article creation guide |

### Database

| File | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | Initial database schema |
| `supabase/migrations/006_auth_system.sql` | Auth tables and RLS policies |
| `supabase/migrations/007_popular_queries.sql` | Popular articles tracking |

---

## Design System

### Mobile Design System v3 (Final)

The mobile app follows a comprehensive design system documented in [MOBILE_UI_DESIGN_SYSTEM_V3.md](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md).

#### Core Principles
1. **Dark-First, Eye-Friendly** - Navy-tinted dark theme (not pure black)
2. **Bottom Tab Navigation** - Thumb-friendly primary actions
3. **Content-First** - UI gets out of the way when reading
4. **Bento Discovery** - Variable card layouts for visual hierarchy
5. **Micro-Interactions + Haptics** - Purposeful feedback
6. **Offline-First** - Explicit download states, graceful degradation
7. **Accessibility-First** - WCAG AA, scalable text, reduced motion

#### Color Tokens

**Navy Scale (Backgrounds):**
```
navy.900  #0a1628  bg.base - Primary background
navy.800  #0f1f35  bg.surface1 - Cards
navy.700  #1e3a5f  bg.surface2 - Hover states
navy.600  #264a78  bg.surface3 - Active states
```

**Accent Scale (Orange Brand):**
```
accent.500  #d4782c  Primary actions (buttons, links)
accent.400  #e08940  Hover state
accent.600  #c96820  Pressed state
```

**Text Colors:**
```
text.primary    #f1f5f9  Main content (off-white for comfort)
text.secondary  #94a3b8  Supporting text (blue-tinted)
text.muted      #64748b  Disabled, captions
text.link       #e08940  Links, interactive text
```

**Status Colors:**
```
status.success  #4ade80  Beginner difficulty
status.warning  #fbbf24  Intermediate difficulty
status.error    #ff6b6b  Advanced difficulty
status.info     #60a5fa  Informational
```

#### Typography

**Font Stack:**
- **Brand moments:** Russo One (app name, H1 article titles)
- **Body text:** System fonts (San Francisco, Roboto) for readability
- **Code blocks:** JetBrains Mono

**Reading Specifications:**
- Body text: 16sp minimum, 1.5 line-height
- Supports up to 200% dynamic type scaling
- Paragraph spacing: 12-16px

#### Spacing (4pt Base Grid)
```
spacing.1   4px   Tight padding
spacing.2   8px   Small gaps
spacing.4   16px  Standard padding
spacing.6   24px  Large gaps
spacing.8   48px  Major sections
```

#### Components

All components use semantic tokens:
- **Button**: 48px height (comfortable touch target)
- **Card**: 12px border-radius, navy.800 background
- **FilterChip**: Multi-select with accent highlights
- **Input**: 44px minimum height (accessibility)

---

## Current Features

### Web Application (Production Ready)

✅ **Authentication**
- Email/password signup and login
- Discord OAuth
- Google OAuth
- Session persistence
- Auto-refresh tokens
- Sign out

✅ **User Features**
- User profiles with display names
- Bookmark articles
- View all bookmarks at `/bookmarks`
- User settings at `/settings`
- Protected routes

✅ **Content**
- Browse articles by game (Project Zomboid, Vintage Story)
- Browse by category (Lua API, Items, Mapping, etc.)
- Difficulty indicators (Beginner/Intermediate/Advanced)
- Markdown rendering with syntax highlighting
- Code block copy buttons
- Responsive design

✅ **Backend**
- Supabase PostgreSQL database
- Row-Level Security (RLS) policies
- Foreign key constraints
- Optimized queries with joins

### Mobile Application (Development)

✅ **Phase 0: Foundations**
- Design system v3 tokens implemented
- 7 primitive components built
- Reduced motion support
- Haptics policy defined

✅ **Phase 1: Navigation**
- Bottom tab navigation (4 tabs)
- 8 screens implemented
- Deep linking configured
- Stack navigation for drill-down

🔄 **Phase 2: Core Features** (Next)
- Search implementation with filters
- Article renderer with TOC
- Code block highlighting
- Image lightbox
- Link handling (internal/external)

📋 **Phase 3: Offline MVP** (Planned)
- Download articles for offline
- Storage management
- Offline search
- Sync indicators

📋 **Phase 4: Polish** (Planned)
- Haptic feedback
- Toast notifications
- Skeleton loading
- Touch animations

📋 **Phase 5: Enhancements** (Future)
- Reading modes (Focus/Night)
- Reading progress tracking
- Bulk downloads
- Related articles

---

## What's Next

### Immediate Priorities (Phase 2)

1. **Search Implementation**
   - Wire up SearchService to SearchScreen
   - Implement filter chip logic (game, type, difficulty)
   - Add search result highlighting
   - Add empty/no results states

2. **Article Renderer**
   - Build markdown renderer with react-native-markdown-display
   - Implement TOC with scroll sync
   - Add code block with copy button
   - Add table support (horizontal scroll)
   - Implement image lightbox
   - Handle internal vs external links

3. **API Integration**
   - Connect all screens to Supabase
   - Implement React Query hooks in mobile
   - Add loading states everywhere
   - Add error handling

### Short-term (Phase 3)

4. **Offline MVP**
   - Implement download functionality
   - Build storage management UI
   - Add offline search with SQLite FTS
   - Show download indicators
   - Handle offline navigation

### Medium-term (Phase 4-5)

5. **Polish & Enhancements**
   - Add haptic feedback wrapper
   - Implement toast notifications
   - Add skeleton loading states
   - Implement reading progress tracking
   - Build related articles carousel

### Long-term

6. **Advanced Features**
   - Reading modes (Focus/Night)
   - Bulk category downloads
   - Push notifications for new articles
   - User contributions/corrections
   - Community features

---

## Known Issues & Limitations

### Web Application

⚠️ **Settings Page - Incomplete**
- Display name update UI exists but not functional
- Password change not implemented
- Email update not implemented
- Delete account not implemented

⚠️ **Reading Progress - Backend Only**
- Database table exists with RLS
- No UI implementation yet
- No tracking on article pages

⚠️ **Email Verification**
- Not configured in Supabase
- Users can sign up without verification

⚠️ **Bookmarks Page**
- No filtering by category
- No search within bookmarks
- No bulk actions

### Mobile Application

⚠️ **Not Connected to Backend**
- All screens use mock data currently
- No actual API calls yet
- Supabase client not configured in mobile app

⚠️ **Missing Implementations**
- Search functionality not wired up
- Article markdown rendering not complete
- Bookmarks not synced with backend
- Authentication not integrated

⚠️ **Offline Features**
- No download functionality yet
- No offline storage
- No sync indicators

### General

⚠️ **Content Management**
- No admin interface
- Articles managed via markdown files + import script
- No in-app article editing

⚠️ **Performance**
- No image optimization yet
- No lazy loading on long lists
- No bundle size optimization

---

## Important Decisions

### Architecture Decisions

**Why Monorepo?**
- Share types and services between web and mobile
- Single source of truth for business logic
- Easier to keep features in sync
- Simplified dependency management

**Why Service Layer Pattern?**
- Clean separation of concerns
- Easy to test
- Easy to swap backends if needed
- Centralized error handling

**Why React Query?**
- Built-in caching (reduces API calls)
- Automatic background refetching
- Optimistic updates out of the box
- Great developer experience

**Why Supabase?**
- PostgreSQL (proven, powerful)
- Built-in authentication
- Row-Level Security (data protection)
- Real-time capabilities (future)
- Self-hostable if needed

### Design Decisions

**Why Navy Instead of Pure Black?**
- Brand consistency with web
- Reduces eye strain
- More premium feel
- Better for OLED screens (still dark)

**Why Bottom Tabs?**
- Industry standard (users expect it)
- Thumb-friendly on large phones
- Clear hierarchy of primary actions
- Better than hamburger menu for discovery

**Why System Fonts for Body?**
- Maximum readability
- No bundle size increase
- Platform-optimized
- Respects user accessibility settings
- Russo One only for brand moments

**Why Offline-First?**
- Modders often work in offline environments
- Documentation should always be accessible
- Improves perceived performance
- Reduces data usage

**Why No In-App Article Editing?**
- Content quality control
- Prevents spam/vandalism
- Git-based workflow for version control
- Markdown is developer-friendly

---

## Resources

### Documentation
- [Mobile Design System v3](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md) - Complete design specification
- [Phase 2 Complete](archive/phase2-complete.md) - Web auth system summary
- [Creating Articles](CREATING_ARTICLES.md) - Article authoring guide
- [Supabase Email Template](guides/supabase-email-template.md) - Email config guide

### Design Assets
- Mobile design specs: `docs/planning/mobile-design/*.md`
- Branding assets: `packages/mobile/assets/branding/`
- Banner images: `packages/mobile/assets/banners/`

### External Resources
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)

### Tools
- [Expo Go App](https://expo.dev/client) - Test on physical devices
- [Supabase Studio](https://app.supabase.com/) - Database management
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

## Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow TypeScript strict mode
   - Use semantic tokens from design system
   - Write accessible code (WCAG AA)

3. **Test locally**
   ```bash
   # Web
   cd packages/web && npm run dev

   # Mobile
   cd packages/mobile && npm start
   ```

4. **Commit with descriptive messages**
   ```bash
   git add .
   git commit -m "feat: Add search filter functionality"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- **TypeScript**: Strict mode, explicit types
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Imports**: Absolute imports preferred
- **Comments**: Explain "why", not "what"

### Git Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation only
style: Formatting, no code change
refactor: Code restructuring
test: Adding tests
chore: Maintenance tasks
```

---

## Contact & Support

### Project Team
- **Primary Developer**: Available via project repository
- **Design Docs**: See `docs/planning/` directory
- **Issue Tracking**: Use GitHub Issues

### Community
- **Discord**: Dystopian Outcasts Community
- **Target Users**: Modders for Project Zomboid, Vintage Story, etc.

---

## Quick Reference

### Common Commands

```bash
# Install dependencies (monorepo)
npm install

# Web dev server
cd packages/web && npm run dev

# Mobile dev server
cd packages/mobile && npm start

# Type check all packages
npm run type-check

# Build web for production
cd packages/web && npm run build

# Run Supabase migrations
cd supabase && supabase migration up
```

### Environment Variables

**Web App** (`packages/web/.env`):
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Mobile App** (configure in code or use Expo env):
```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Important URLs

- **Web App (local)**: http://localhost:5173
- **Supabase Studio**: https://app.supabase.com/
- **Expo DevTools**: Opens automatically with `npm start`

---

## Version History

- **v1.0** - Initial web application with static content
- **v1.1** - Authentication system, user features, Supabase backend
- **v1.2** - Mobile app foundation (Phase 0 & 1 complete) ← **Current**

---

## Final Notes

### Project Health
- ✅ TypeScript compiles with no errors
- ✅ No console warnings in development
- ✅ Design system fully documented
- ✅ Component library established
- ✅ Navigation structure complete

### Ready for Handoff
This project is well-positioned for continued development. The foundations are solid:
- Complete design system
- Reusable component library
- Clear architecture patterns
- Comprehensive documentation

### Next Developer Should Focus On
1. Connecting mobile app to Supabase backend
2. Implementing search functionality
3. Building article markdown renderer
4. Adding offline download capabilities

---

**Last Updated:** January 28, 2026
**Document Version:** 1.0
**Project Status:** Active Development - Mobile Phase 1 Complete

For questions or clarifications, refer to the documentation in `docs/` or examine the detailed design specs in `docs/planning/MOBILE_UI_DESIGN_SYSTEM_V3.md`.
