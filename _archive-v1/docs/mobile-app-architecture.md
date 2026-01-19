# Mobile App Architecture

## Project Structure

We're creating a **monorepo** - one Git repository containing multiple related projects that share code.

```
dystopian-wiki-platform/          # New repo (or restructure existing)
├── packages/
│   ├── shared/                   # Shared TypeScript code
│   │   ├── types/                # Interfaces for articles, users, etc.
│   │   ├── utils/                # Helper functions
│   │   └── constants/            # Shared constants
│   │
│   ├── web/                      # Current React wiki
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── mobile/                   # New React Native app
│   │   ├── app/                  # Expo Router pages
│   │   ├── components/           # React Native components
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API calls, storage
│   │   └── package.json
│   │
│   └── api/                      # Optional FastAPI backend (later)
│       ├── app/
│       ├── requirements.txt
│       └── Dockerfile
│
├── content/                      # Wiki content (shared)
│   └── data/
│       └── build-41/
│           └── modding/          # Same JSON articles
│
├── scripts/                      # Python parser tools
│   └── pz_parser.py
│
└── package.json                  # Root package.json (workspaces)
```

---

## Why Monorepo?

| Benefit | Explanation |
|---------|-------------|
| **Shared types** | Change an interface once, both web and mobile update |
| **Shared content** | One source of truth for wiki articles |
| **Atomic changes** | Update API + mobile + web in one commit |
| **Easier refactoring** | Find all usages across projects |

---

## Mobile App Structure (Expo Router)

Expo Router uses file-based routing (like Next.js). The folder structure = the URL structure.

```
mobile/
├── app/                          # Routes (pages)
│   ├── _layout.tsx               # Root layout (navigation container)
│   ├── index.tsx                 # Home screen (/)
│   ├── search.tsx                # Search screen (/search)
│   ├── bookmarks.tsx             # User bookmarks (/bookmarks)
│   ├── settings.tsx              # Settings (/settings)
│   │
│   ├── (auth)/                   # Auth group (shared layout)
│   │   ├── _layout.tsx
│   │   ├── login.tsx             # /login
│   │   └── register.tsx          # /register
│   │
│   └── [game]/                   # Dynamic: /pz, /vs
│       ├── _layout.tsx
│       ├── index.tsx             # Game home (/pz)
│       └── [version]/            # Dynamic: /pz/ │           ├── _layout.tsx
│           └── [category]/       # /pz/build-41/modding
│               └── [slug].tsx    # /pz/build-41/modding/weapons-guide
│
├── components/
│   ├── ArticleCard.tsx           # Article preview card
│   ├── ArticleContent.tsx        # Markdown renderer
│   ├── SearchBar.tsx             # Search input
│   ├── GameSelector.tsx          # Game picker (PZ, VS)
│   └── OfflineIndicator.tsx      # Shows when offline
│
├── hooks/
│   ├── useArticle.ts             # Fetch single article
│   ├── useSearch.ts              # Search functionality
│   ├── useAuth.ts                # Authentication state
│   ├── useBookmarks.ts           # User bookmarks
│   └── useOffline.ts             # Offline detection + cached content
│
├── services/
│   ├── supabase.ts               # Supabase client setup
│   ├── api.ts                    # API calls
│   ├── storage.ts                # AsyncStorage helpers
│   └── cache.ts                  # Offline caching logic
│
├── constants/
│   ├── colors.ts                 # Theme colors
│   └── config.ts                 # API URLs, etc.
│
└── assets/
    ├── fonts/
    └── images/
```

---

## Key Screens

### Home Screen
```
┌─────────────────────────────────────┐
│  Dystopian Outcasts Wiki            │
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Project   │ │   Vintage   │   │
│  │   Zomboid   │ │    Story    │   │
│  │             │ │   (Soon)    │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  [🔍 Search all articles...]        │
│                                     │
│  Recent Articles                    │
│  ┌─────────────────────────────┐   │
│  │ Weapon Properties Guide     │   │
│  │ Understanding MinDamage...  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Complete Repair Reference   │   │
│  │ All 76 repair definitions   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ────────────────────────────────  │
│  [🏠]    [🔍]    [📚]    [⚙️]      │
└─────────────────────────────────────┘
```

### Article Screen
```
┌─────────────────────────────────────┐
│  ← Back                    [🔖]     │
│                                     │
│  Weapon Properties Guide            │
│  Intermediate • Items               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Table of Contents          │   │
│  │ • MinDamage & MaxDamage    │   │
│  │ • Categories               │   │
│  │ • Condition System         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ## Introduction                    │
│                                     │
│  Every weapon in Project Zomboid    │
│  has properties that define how     │
│  it behaves in combat...            │
│                                     │
│  ## MinDamage & MaxDamage           │
│                                     │
│  ```lua                             │
│  MinDamage = 0.8,                   │
│  MaxDamage = 1.3,                   │
│  ```                                │
│                                     │
│  ────────────────────────────────  │
│  Related: Repair System, Skills     │
└─────────────────────────────────────┘
```

### Search Screen
```
┌─────────────────────────────────────┐
│  [🔍 how to repair weapons    ×]    │
│                                     │
│  Results for "how to repair..."     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔧 Weapon Repair System     │   │
│  │ Complete guide to the fix   │   │
│  │ system and repair items     │   │
│  │ 98% match                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📋 Fixing Reference         │   │
│  │ All 76 repair definitions   │   │
│  │ from vanilla scripts        │   │
│  │ 87% match                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⚔️ Weapon Properties        │   │
│  │ Understanding ConditionMax  │   │
│  │ and durability              │   │
│  │ 72% match                   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Data Flow

### Reading an Article

```
User taps article
       │
       ▼
┌─────────────────┐
│ Check offline   │
│ cache first     │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Cached? │
    └────┬────┘
         │
    Yes  │  No
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
┌─────────┐    ┌─────────────┐
│ Return  │    │ Fetch from  │
│ cached  │    │ Supabase    │
└─────────┘    └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │ Cache for   │
               │ offline     │
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │ Display     │
               │ article     │
               └─────────────┘
```

### Search Flow

```
User types query
       │
       ▼
┌─────────────────┐
│ Debounce input  │
│ (300ms delay)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check rate      │
│ limit status    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Send to         │────▶│ Supabase        │
│ Supabase        │     │                 │
└─────────────────┘     │ 1. Full-text    │
                        │    search       │
                        │ 2. Vector       │
                        │    similarity   │
                        │ 3. Combine &    │
                        │    rank         │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Return ranked   │
                        │ results         │
                        └─────────────────┘
```

---

## Offline Support

### What Gets Cached

| Content | Cache Strategy |
|---------|---------------|
| **Recently viewed articles** | Auto-cached after viewing |
| **Bookmarked articles** | Auto-synced for offline |
| **Search index** | Partial, for basic offline search |
| **User preferences** | Always cached |

### Storage Locations

```
AsyncStorage (React Native)
├── @auth_token          # User session
├── @user_preferences    # Theme, settings
├── @bookmarks           # List of bookmarked article IDs
├── @articles_cache      # Full article content
│   ├── weapons-guide
│   ├── repair-system
│   └── ...
└── @search_history      # Recent searches
```

### Offline Mode Behavior

| Feature | Online | Offline |
|---------|--------|---------|
| Browse cached articles | ✅ | ✅ |
| Search | Full semantic | Basic text match on cached |
| Bookmark | Syncs immediately | Queued, syncs when online |
| New articles | Available | Not available |

---

## Authentication Flow

```
App Launch
    │
    ▼
┌─────────────────┐
│ Check stored    │
│ session token   │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Valid?  │
    └────┬────┘
         │
    Yes  │  No
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
┌─────────┐    ┌─────────────┐
│ Load    │    │ Show login  │
│ user    │    │ (optional)  │
│ data    │    │             │
└─────────┘    │ Can browse  │
               │ as anon     │
               └─────────────┘
```

### Auth Providers (via Supabase)

- Email + Password
- Google
- Discord (good for gaming community)
- GitHub (good for modders)

---

## Relationship to Current Wiki

### What Stays the Same

| Aspect | Details |
|--------|---------|
| Content format | Same JSON files with markdown |
| Article structure | Same fields (id, title, content, tags, etc.) |
| URL patterns | /pz/build-41/modding/[category]/[slug] |
| TypeScript types | Shared via packages/shared |

### What Changes

| Current Wiki | Mobile App |
|--------------|------------|
| Fetches static JSON | Calls Supabase API |
| IndexedDB cache | AsyncStorage cache |
| React Router | Expo Router |
| CSS files | React Native StyleSheet |
| No auth | Supabase Auth |
| No offline | Full offline support |

---

## Development Workflow

### Local Development

```bash
# Start mobile app in development
cd packages/mobile
npx expo start

# Opens Expo DevTools
# Scan QR code with Expo Go app on your phone
# Or press 'w' for web, 'a' for Android emulator, 'i' for iOS simulator
```

### Building for Production

```bash
# Build for both platforms (cloud build via EAS)
cd packages/mobile
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

---

## Next Steps

1. Set up monorepo structure
2. Initialize Expo project in packages/mobile
3. Set up Supabase project
4. Build core screens (Home, Article, Search)
5. Implement offline caching
6. Add authentication
7. Test on devices
8. Submit to app stores
