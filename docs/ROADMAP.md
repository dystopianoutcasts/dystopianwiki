# Dystopian Wiki - Project Roadmap

**Current Version:** v1.2 (Mobile Phase 1 Complete)
**Last Updated:** January 28, 2026

---

## Timeline Overview

```
v1.0          v1.1              v1.2              v1.3 (Future)     v2.0 (Future)
  │             │                 │                    │                │
  ├─────────────┼─────────────────┼────────────────────┼────────────────┤
  │             │                 │                    │                │
Web App    Auth System      Mobile Phase 1      Mobile Phase 2    Offline +
Static     + Bookmarks       Design + Nav        Core Features     Polish
```

---

## ✅ Completed Phases

### v1.0 - Web Application Foundation
**Completed:** December 2025

#### Achievements
- ✅ Static web application with React + Vite
- ✅ Markdown article rendering
- ✅ Game and category navigation
- ✅ Responsive design
- ✅ Code syntax highlighting
- ✅ Initial content (Project Zomboid, Vintage Story)

#### Tech Stack Established
- React 18, TypeScript, Vite
- React Router v6
- CSS Modules
- Markdown rendering

---

### v1.1 - Authentication & User Features (Phase 2)
**Completed:** January 2026

#### Achievements
- ✅ Supabase backend integration
- ✅ Email/password authentication
- ✅ Discord OAuth
- ✅ Google OAuth
- ✅ User profiles
- ✅ Bookmark system with optimistic updates
- ✅ Settings page
- ✅ Row-Level Security (RLS) policies
- ✅ React Query for state management

#### Database Schema
- ✅ `articles` table
- ✅ `user_profiles` table
- ✅ `bookmarks` table
- ✅ `reading_progress` table (backend only)

**Documentation:** [phase2-complete.md](archive/phase2-complete.md)

---

### v1.2 - Mobile App Foundation (Phase 0 & 1)
**Completed:** January 2026 ← **Current Version**

#### Phase 0: Foundations
- ✅ Design System v3 (Navy-tinted dark theme)
  - Complete semantic color tokens
  - Spacing scale (4pt base grid)
  - Typography system
  - Elevation and animation tokens
  - WCAG AA accessibility compliant
- ✅ Primitive component library (7 components)
  - Text, Surface, Button, Divider
  - FilterChip, BentoCard, Skeleton
- ✅ Reduced motion support
- ✅ Haptics policy defined
- ✅ Theme configuration in `theme/index.ts`

#### Phase 1: Navigation
- ✅ Monorepo structure (web + mobile + shared)
- ✅ Bottom tab navigation (4 tabs)
- ✅ Stack navigators for drill-down
- ✅ 8 screens implemented (UI only)
  - HomeScreen (Bento layout)
  - ArticleScreen (with TOC)
  - SearchScreen (with filters)
  - BookmarksScreen (with progress)
  - ProfileScreen (stats + settings)
  - CategoriesScreen
  - CategoryArticlesScreen
  - AuthScreen
- ✅ Deep linking configured
- ✅ Navigation types defined

**Documentation:** [MOBILE_UI_DESIGN_SYSTEM_V3.md](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md)

---

## 🔄 In Progress

### v1.3 - Mobile Core Features (Phase 2)
**Target:** February 2026
**Status:** Next up

#### Goals
- [ ] **Search Implementation**
  - Wire up SearchService to mobile
  - Implement filter logic (game, type, difficulty)
  - Search result highlighting
  - Empty/no results states

- [ ] **Article Renderer**
  - Markdown rendering with react-native-markdown-display
  - Table of Contents with scroll sync
  - Code blocks with copy button
  - Syntax highlighting
  - Horizontal scroll tables
  - Image lightbox
  - Internal vs external link handling

- [ ] **API Integration**
  - Connect all screens to Supabase
  - React Query hooks in mobile
  - Loading states
  - Error handling
  - Pull-to-refresh

- [ ] **Bookmark Sync**
  - Sync bookmarks between web and mobile
  - Optimistic updates
  - Offline queue

**Estimated Duration:** 3-4 weeks

---

## 📋 Planned Phases

### v1.4 - Offline Functionality (Phase 3)
**Target:** March 2026
**Status:** Planned

#### Goals
- [ ] **Download System**
  - Download articles for offline reading
  - Storage management UI
  - Download progress indicators
  - WiFi-only download option

- [ ] **Offline Storage**
  - AsyncStorage for metadata
  - FileSystem for article content
  - Image caching (separate files)
  - SQLite FTS for offline search

- [ ] **Offline UX**
  - Offline indicator in header
  - Download state icons (cloud, downloaded, outdated)
  - "Not downloaded" placeholder screens
  - Sync status indicators

- [ ] **Storage Management**
  - View downloaded content
  - Clear downloads by game/category
  - Storage usage display
  - Auto-download bookmarks setting

**Estimated Duration:** 3-4 weeks

---

### v1.5 - Polish & Animations (Phase 4)
**Target:** April 2026
**Status:** Planned

#### Goals
- [ ] **Micro-Interactions**
  - Haptic feedback wrapper (light/medium/heavy)
  - Touch animations (scale, highlights)
  - Button press feedback
  - Bookmark pulse animation

- [ ] **Loading States**
  - Skeleton screens with shimmer
  - Pull-to-refresh custom spinner
  - Inline loading indicators
  - Respect reduced motion

- [ ] **Toasts & Feedback**
  - Toast notification system
  - Success animations (checkmarks)
  - Error shake animations
  - Copy confirmation

- [ ] **Page Transitions**
  - Optimized timing (240ms push, 200ms pop)
  - Modal slide from bottom
  - Tab cross-fade
  - FAB hide/show on scroll

**Estimated Duration:** 2-3 weeks

---

### v1.6 - Reading Enhancements (Phase 5)
**Target:** May 2026
**Status:** Planned

#### Goals
- [ ] **Reading Progress**
  - Track scroll position
  - Resume reading indicators
  - Progress percentages
  - "Continue reading" on Home

- [ ] **Reading Modes**
  - Focus mode (default)
  - Night mode (warmer colors)
  - Mode toggle in settings
  - Persist preference

- [ ] **Related Content**
  - Related articles carousel
  - "You might also like" section
  - Smart recommendations based on reading history

- [ ] **Bulk Downloads**
  - Download entire categories
  - Download by game
  - Background download queue
  - Size estimates before download

**Estimated Duration:** 2-3 weeks

---

## 🚀 Future Roadmap (v2.0+)

### v2.0 - Community Features
**Target:** Q3 2026
**Status:** Ideation

#### Potential Features
- [ ] User contributions
  - Suggest edits to articles
  - Community corrections
  - Voting system

- [ ] Comments & Discussion
  - Article comments
  - Q&A sections
  - Upvotes/downvotes

- [ ] User Profiles
  - Public profiles
  - Contribution history
  - Reputation system

- [ ] Notifications
  - New article alerts
  - Update notifications
  - Response notifications

---

### v2.1 - Advanced Search & Discovery
**Status:** Ideation

#### Potential Features
- [ ] Advanced search filters
- [ ] Full-text search with snippets
- [ ] Search history
- [ ] Saved searches
- [ ] Personalized recommendations
- [ ] Popular articles trending

---

### v2.2 - Multi-Language Support
**Status:** Ideation

#### Potential Features
- [ ] UI internationalization
- [ ] Article translations
- [ ] Language selection
- [ ] Community-driven translations

---

### v2.3 - Enhanced Content
**Status:** Ideation

#### Potential Features
- [ ] Video tutorials
- [ ] Interactive examples
- [ ] Code playgrounds
- [ ] Embedded media
- [ ] Downloadable resources (mod files, templates)

---

## 🎯 Milestones

### Q1 2026 ✅ (Completed)
- ✅ v1.0 - Web app foundation
- ✅ v1.1 - Authentication system
- ✅ v1.2 - Mobile Phase 0 & 1

### Q2 2026 🔄 (Current)
- 🔄 v1.3 - Mobile Phase 2 (Core features)
- 📋 v1.4 - Mobile Phase 3 (Offline)
- 📋 v1.5 - Mobile Phase 4 (Polish)

### Q3 2026 📋 (Planned)
- 📋 v1.6 - Mobile Phase 5 (Enhancements)
- 📋 v1.7 - Production release
- 📋 v2.0 - Community features

---

## 📊 Feature Matrix

| Feature | Web | Mobile | Priority |
|---------|-----|--------|----------|
| **Content** |
| Browse articles | ✅ | ✅ | High |
| Read articles | ✅ | 🔄 | High |
| Search & filter | ✅ | 🔄 | High |
| Syntax highlighting | ✅ | 📋 | High |
| TOC navigation | ✅ | 📋 | Medium |
| **User Features** |
| Sign up / Sign in | ✅ | ✅ | High |
| OAuth (Discord/Google) | ✅ | ✅ | High |
| Bookmarks | ✅ | 📋 | High |
| Reading progress | 📋 | 📋 | Medium |
| Settings | ✅ | ✅ | Medium |
| Profile | ✅ | ✅ | Medium |
| **Mobile Specific** |
| Offline reading | N/A | 📋 | High |
| Download management | N/A | 📋 | High |
| Haptic feedback | N/A | 📋 | Low |
| Reading modes | N/A | 📋 | Low |
| **Advanced** |
| Comments | ❌ | ❌ | Low |
| Contributions | ❌ | ❌ | Low |
| Notifications | ❌ | ❌ | Low |

**Legend:**
- ✅ Complete
- 🔄 In progress
- 📋 Planned
- ❌ Not planned

---

## 🔧 Technical Debt & Improvements

### High Priority
- [ ] Web: Complete settings page (display name, password change)
- [ ] Web: Implement reading progress tracking UI
- [ ] Mobile: Connect to Supabase backend
- [ ] Mobile: Implement search functionality
- [ ] Mobile: Article markdown renderer

### Medium Priority
- [ ] Web: Add filtering to bookmarks page
- [ ] Web: Implement email verification flow
- [ ] Mobile: Offline storage architecture
- [ ] Mobile: Image optimization
- [ ] Shared: Improve error handling

### Low Priority
- [ ] Web: Bundle size optimization
- [ ] Web: Lazy loading for long lists
- [ ] Mobile: Performance profiling
- [ ] Shared: Unit test coverage
- [ ] Shared: E2E test suite

---

## 📈 Success Metrics

### Current (v1.2)
- ✅ TypeScript compiles with zero errors
- ✅ No console warnings in development
- ✅ Design system fully documented
- ✅ Component library established
- ✅ Navigation structure complete
- ✅ All screens implemented (UI)

### Target for v1.3
- [ ] All screens connected to backend
- [ ] Search returns real results
- [ ] Articles render from Supabase
- [ ] Bookmarks sync between platforms
- [ ] Loading states everywhere

### Target for v1.4
- [ ] Articles downloadable for offline
- [ ] Offline search works
- [ ] Storage management functional
- [ ] Graceful offline degradation

### Target for v2.0 (Production)
- [ ] 1000+ articles across multiple games
- [ ] 10,000+ registered users
- [ ] 95%+ uptime
- [ ] <2s average page load
- [ ] WCAG AA accessibility compliance
- [ ] SEO optimized (web)

---

## 🎨 Design Evolution

### v1 - Pure Black Theme
- Pure black backgrounds (#000000)
- High contrast
- Basic component library

### v2 - Refinements
- Off-white text (#f1f5f9) for reading comfort
- Contrast validation
- Markdown rendering rules

### v3 - Final (Current)
- Navy-tinted theme (#0a1628) for brand consistency
- Complete semantic token system
- Accessibility-first approach
- Offline-first architecture
- Comprehensive component library

---

## 📝 Decision Log

### Why Navy Instead of Pure Black?
- **Decision:** Use navy-tinted dark theme
- **Rationale:** Brand consistency with web, reduces eye strain, premium feel
- **Date:** January 2026

### Why Bottom Tabs?
- **Decision:** Bottom tab navigation for mobile
- **Rationale:** Industry standard, thumb-friendly, better for discovery
- **Date:** January 2026

### Why Offline-First?
- **Decision:** Build offline functionality early
- **Rationale:** Modders often work offline, improves reliability
- **Date:** January 2026

### Why Service Layer Pattern?
- **Decision:** Use ApiService facade with React Query
- **Rationale:** Clean separation, easy to test, centralized logic
- **Date:** December 2025

### Why Monorepo?
- **Decision:** Single repo for web, mobile, and shared code
- **Rationale:** Share types/services, single source of truth
- **Date:** January 2026

---

## 🔗 Related Documents

- [HANDOFF.md](HANDOFF.md) - Complete project documentation
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick developer reference
- [MOBILE_UI_DESIGN_SYSTEM_V3.md](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md) - Design specification
- [phase2-complete.md](archive/phase2-complete.md) - Web auth completion

---

## 📞 Feedback & Updates

This roadmap is a living document. Priorities may shift based on:
- User feedback
- Technical constraints
- Resource availability
- Community needs

**Last Updated:** January 28, 2026
**Next Review:** End of February 2026

---

**Questions?** See [HANDOFF.md](HANDOFF.md) or open a GitHub Issue.
