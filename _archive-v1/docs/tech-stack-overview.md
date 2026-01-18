# Tech Stack Overview

## The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER DEVICES                            │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│   │   iPhone    │  │   Android   │  │   Browser   │         │
│   │    App      │  │    App      │  │   (Web)     │         │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│          │                │                │                 │
│          └────────────────┼────────────────┘                 │
│                           │                                  │
│              React Native + Expo (one codebase)              │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                           │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │    Auth     │  │  Database   │  │   Storage   │           │
│  │             │  │ PostgreSQL  │  │   (Files)   │           │
│  │ • Email     │  │             │  │             │           │
│  │ • Google    │  │ • Articles  │  │ • Images    │           │
│  │ • Discord   │  │ • Users     │  │ • Offline   │           │
│  │             │  │ • Bookmarks │  │   packs     │           │
│  └─────────────┘  │ • pgvector  │  └─────────────┘           │
│                   │   (search)  │                             │
│                   └─────────────┘                             │
└───────────────────────────────────────────────────────────────┘
```

---

## Each Technology Explained

### React Native

**What it is:** A JavaScript framework for building mobile apps that compile to native iOS and Android code.

**Why not just make a website?**
- App stores give visibility (people search "project zomboid" in Play Store)
- Push notifications for content updates
- Offline reading (download articles for no-internet modding)
- Better mobile UX (native navigation, gestures)

**Why React Native specifically?**
- We already know React + TypeScript from the current wiki
- One codebase for iOS, Android, AND web
- Huge ecosystem, lots of libraries
- Companies like Discord, Shopify, and Coinbase use it

**Key concept:** You write JavaScript/TypeScript, but the app renders actual native components (not a web view). It's fast.

---

### Expo

**What it is:** A platform built on top of React Native that makes development easier.

**What it does for us:**
- `expo start` - Run the app in development
- `expo build` - Compile to iOS/Android without needing Xcode or Android Studio locally
- `expo publish` - Push updates to users without going through app stores (for non-native changes)
- EAS (Expo Application Services) - Cloud builds, app store submissions

**Why use it:** React Native alone requires Xcode (Mac only) for iOS builds. Expo builds in the cloud, so we can develop from Windows.

---

### Supabase

**What it is:** An open-source Firebase alternative. It's a "backend-as-a-service" that gives you:

| Service | What It Does |
|---------|--------------|
| **Auth** | User signup/login with email, Google, Discord, etc. |
| **Database** | PostgreSQL database with a REST API auto-generated |
| **Storage** | File storage (like S3) for images, downloadable content |
| **Realtime** | WebSocket subscriptions for live updates |
| **Edge Functions** | Serverless functions (like AWS Lambda) |

**Why not Firebase?**
- Supabase uses PostgreSQL (industry standard, easy to export/migrate)
- Firebase uses proprietary NoSQL (vendor lock-in)
- Supabase is open source (can self-host if needed)

**Why not build our own backend?**
- Auth is hard to do securely (password hashing, sessions, OAuth)
- Supabase handles it all for free (up to 50k monthly active users)
- We can add a custom FastAPI backend later if needed

---

### PostgreSQL + pgvector

**What it is:** PostgreSQL is the world's most advanced open-source database. pgvector is an extension for vector similarity search.

**Why this matters for search:**

Traditional search:
```
User types: "katana"
Database: Find rows where text contains "katana"
Result: Exact matches only
```

Vector search (with pgvector):
```
User types: "how to make sword stronger"
System: Convert query to numbers representing meaning
Database: Find articles with similar meaning
Result: Weapon damage guide, repair system, skill bonuses
        (even though none contain "sword stronger")
```

**How vectors work (simplified):**
- Every article gets converted to ~1500 numbers (an "embedding")
- These numbers represent the article's meaning
- Similar meanings = similar numbers
- Search finds articles with numbers close to the query's numbers

**Cost:** Free - pgvector is included in Supabase PostgreSQL.

---

### Vercel

**What it is:** A hosting platform optimized for frontend frameworks (React, Next.js, etc.).

**Why we'd use it:**
- Free tier: 100GB bandwidth/month
- Automatic deployments from GitHub
- Built-in CDN (content delivery network) - fast globally
- Handles HTTPS, caching, etc.

**vs GitHub Pages (current):**
- GitHub Pages: Static files only, no server-side features
- Vercel: Can do server-side rendering, API routes, more flexibility

---

### Cloudflare (Optional Layer)

**What it is:** A CDN and security service that sits between users and your servers.

**What we'd use (free tier):**
- DDoS protection (blocks attack traffic)
- Caching (serves content from servers close to users)
- Free SSL certificates
- Basic analytics

**What we're NOT paying for:**
- Advanced rate limiting ($20/month) - we'll do this ourselves
- WAF rules ($20/month) - not needed at our scale

**Important:** Cloudflare had multiple outages in 2025. We're designing so the site works without it - it's an enhancement, not a requirement.

---

## What We're NOT Using (And Why)

| Technology | Why Not |
|------------|---------|
| **Firebase** | Proprietary NoSQL, harder to export data |
| **AWS directly** | Complex, overkill for our needs, expensive at small scale |
| **Flutter** | Would need to learn Dart, we already know React |
| **Native iOS/Android** | Two codebases to maintain, need Mac for iOS |
| **MongoDB** | PostgreSQL is better for relational data + has pgvector |
| **LLM/AI answers** | Too expensive right now, can add later |

---

## Cost Summary

### Free Tier (Where We Start)

| Service | Free Limit | Our Expected Usage |
|---------|------------|-------------------|
| Supabase | 500MB DB, 1GB storage, 50k MAU | Well under |
| Vercel | 100GB bandwidth | Well under |
| Cloudflare | Unlimited CDN | N/A |
| Expo EAS | 30 builds/month | Plenty |
| Google Play | $25 one-time | One-time |
| Apple Developer | $99/year | Annual |

**Year 1 total: ~$125** (just app store fees)

### If We Grow

| Threshold | Upgrade Needed | Cost |
|-----------|---------------|------|
| 50k+ monthly users | Supabase Pro | $25/month |
| Complex search logic | Add FastAPI backend | $5-20/month |
| Heavy traffic | Vercel Pro | $20/month |

---

## Questions?

If something here doesn't make sense, ask in Discord or add a question to this doc. This is meant to be a living reference.
