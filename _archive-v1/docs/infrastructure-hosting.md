# Infrastructure & Hosting

## Current State (Static Wiki)

```
┌─────────────────────────────────────────────────────────────┐
│                     CURRENT SETUP                            │
│                                                              │
│   GitHub Repository                                          │
│         │                                                    │
│         │ Push to main                                       │
│         ▼                                                    │
│   GitHub Actions                                             │
│         │                                                    │
│         │ Build (npm run build)                              │
│         ▼                                                    │
│   GitHub Pages                                               │
│         │                                                    │
│         │ Serve static files                                 │
│         ▼                                                    │
│   Users' Browsers                                            │
│                                                              │
│   Cost: $0/month                                             │
└─────────────────────────────────────────────────────────────┘
```

**What we have now:**
- React app built to static HTML/JS/CSS
- JSON files as "API" (fetched by browser)
- No backend, no database, no auth
- Works great, but limited

---

## Future State (Full App)

```
┌─────────────────────────────────────────────────────────────┐
│                     FUTURE SETUP                             │
│                                                              │
│                     ┌─────────────┐                         │
│                     │   Vercel    │ Website                  │
│                     │   (Free)    │ React app                │
│                     └──────┬──────┘                         │
│                            │                                 │
│   ┌─────────────┐          │          ┌─────────────┐       │
│   │   iOS App   │          │          │ Android App │       │
│   │ (App Store) │          │          │(Play Store) │       │
│   └──────┬──────┘          │          └──────┬──────┘       │
│          │                 │                 │               │
│          └─────────────────┼─────────────────┘               │
│                            │                                 │
│                            ▼                                 │
│                     ┌─────────────┐                         │
│                     │  Supabase   │                         │
│                     │   (Free)    │                         │
│                     │             │                         │
│                     │ • Auth      │                         │
│                     │ • Database  │                         │
│                     │ • Storage   │                         │
│                     │ • Search    │                         │
│                     └─────────────┘                         │
│                                                              │
│   Cost: ~$125/year (app store fees only)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Service Breakdown

### Vercel (Website Hosting)

**What:** Hosts the web version of the wiki

**Why Vercel over GitHub Pages:**
- Better build pipeline
- Edge caching built-in
- Can add server-side features later
- Preview deployments for PRs

**Free tier includes:**
- 100GB bandwidth/month
- Unlimited static sites
- Automatic HTTPS
- Edge network (fast globally)

**When we'd pay:**
- Over 100GB bandwidth
- Need server-side rendering
- Team features

**Cost if we outgrow free:** $20/month (Pro plan)

---

### Supabase (Backend)

**What:** All-in-one backend - auth, database, storage, realtime

**Free tier includes:**

| Resource | Limit |
|----------|-------|
| Database | 500 MB |
| Storage | 1 GB |
| Bandwidth | 5 GB/month |
| Monthly active users | 50,000 |
| Edge function invocations | 500,000/month |

**Our expected usage:**
- Database: ~50-100 MB (articles + users + bookmarks)
- Storage: ~200-500 MB (images, offline packs)
- MAU: < 10,000 initially

**When we'd pay:**
- Over 500 MB database
- Over 50k monthly users
- Need more storage

**Cost if we outgrow free:** $25/month (Pro plan)

---

### Expo EAS (Mobile Builds)

**What:** Cloud service to build iOS and Android apps

**Why we need it:**
- iOS builds require macOS + Xcode
- EAS builds in the cloud (no Mac needed)
- Handles signing, certificates, etc.

**Free tier includes:**
- 30 builds/month
- Unlimited updates (OTA)
- Basic build priority

**Our expected usage:**
- Maybe 5-10 builds/month during active development
- 1-2 builds/month once stable

**When we'd pay:**
- Need faster builds
- Need more than 30 builds/month
- Team features

**Cost if we outgrow free:** $99/month (Production plan) - unlikely to need

---

### App Stores

**Google Play Store:**
- One-time fee: $25
- Review time: 1-3 days (often hours)
- No annual renewal

**Apple App Store:**
- Annual fee: $99/year
- Review time: 24-48 hours
- Must renew yearly or app is removed

---

### Cloudflare (Optional CDN Layer)

**What:** CDN, DDoS protection, caching

**Why optional:**
- Vercel already has a CDN
- Supabase has some protection
- Cloudflare adds extra layer if needed

**Free tier includes:**
- Unlimited bandwidth
- DDoS protection
- Basic caching
- Free SSL

**What costs money:**
- Advanced rate limiting: $20/month
- WAF rules: $20/month
- Advanced analytics: $20/month

**Our approach:** Use free tier for extra protection, DIY rate limiting in Supabase

---

## Cost Summary

### Year 1 (Startup Phase)

| Service | Cost |
|---------|------|
| Vercel | $0 |
| Supabase | $0 |
| Expo EAS | $0 |
| Cloudflare | $0 |
| Google Play (one-time) | $25 |
| Apple Developer (annual) | $99 |
| **Total** | **~$125** |

### Year 2+ (If We Stay Small)

| Service | Cost/Year |
|---------|-----------|
| Vercel | $0 |
| Supabase | $0 |
| Expo EAS | $0 |
| Cloudflare | $0 |
| Apple Developer | $99 |
| **Total** | **$99/year** |

### If We Grow (10k+ monthly users)

| Service | Cost/Month |
|---------|------------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Expo EAS | $0 (probably still fine) |
| Cloudflare | $0 (free tier enough) |
| **Total** | **~$45/month + $99/year** |

---

## Deployment Pipeline

### Website (Vercel)

```
Developer pushes to GitHub
          │
          ▼
    Vercel detects push
          │
          ▼
    Runs build (npm run build)
          │
          ▼
    Deploys to edge network
          │
          ▼
    Live in ~60 seconds
```

### Mobile App (Expo EAS)

```
Developer runs: eas build --platform all
          │
          ▼
    EAS queues build job
          │
          ▼
    Builds iOS and Android (~15-30 min)
          │
          ▼
    Downloads .ipa and .aab files
          │
          ▼
    Submit: eas submit --platform all
          │
          ▼
    Uploaded to App Store / Play Store
          │
          ▼
    Review (hours to days)
          │
          ▼
    Published to users
```

### Over-the-Air Updates (No Store Review)

For non-native changes (JS/content only):

```
Developer runs: eas update --branch production
          │
          ▼
    Users' apps download update in background
          │
          ▼
    Next app launch uses new code
          │
          ▼
    No app store review needed!
```

---

## Environment Setup

### Development

```bash
# Clone repo
git clone [repo-url]
cd dystopian-wiki-platform

# Install dependencies
npm install

# Start web dev server
cd packages/web
npm run dev

# Start mobile dev server (separate terminal)
cd packages/mobile
npx expo start
```

### Environment Variables

```bash
# .env.local (never commit this!)

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...

# Only for admin tasks
SUPABASE_SERVICE_KEY=eyJhbGciOiJI...  # NEVER expose this
```

### Secrets Management

| Secret | Where It Lives | Who Has Access |
|--------|---------------|----------------|
| Supabase anon key | `.env.local`, Vercel env vars | Safe to expose (RLS protects data) |
| Supabase service key | Vercel env vars only | Admin only, never in code |
| App signing keys | EAS Credentials | Auto-managed by Expo |
| Apple/Google creds | EAS Credentials | Auto-managed by Expo |

---

## Monitoring & Alerts

### What to Monitor

| Metric | Where | Alert Threshold |
|--------|-------|-----------------|
| Website uptime | Vercel dashboard | Any downtime |
| API response time | Supabase dashboard | > 500ms average |
| Error rate | Vercel/Supabase logs | > 1% of requests |
| Database size | Supabase dashboard | > 400 MB (80% of free) |
| Bandwidth usage | Supabase dashboard | > 4 GB (80% of free) |

### Free Monitoring Options

- **Vercel Analytics** - Built-in, free tier available
- **Supabase Dashboard** - Built-in metrics
- **UptimeRobot** - Free uptime monitoring (50 monitors)
- **Sentry** - Error tracking (free tier: 5k events/month)

---

## Disaster Recovery

### If Vercel Goes Down

- Website unavailable
- Mobile apps still work (talk directly to Supabase)
- Can quickly deploy to Cloudflare Pages or Netlify as backup

### If Supabase Goes Down

- Auth stops working
- Database unavailable
- Mobile apps show cached content only
- Recovery: They have 99.9% SLA, usually back quickly

### If We Need to Migrate Off Supabase

1. Export PostgreSQL database (standard pg_dump)
2. Move to any PostgreSQL host (AWS RDS, DigitalOcean, etc.)
3. Update connection strings
4. Auth would need reimplementation (biggest effort)

### Backup Strategy

- **Database:** Supabase auto-backups (7 days on free, 30 days on Pro)
- **Content:** Lives in Git (always recoverable)
- **User data:** Regular exports to secure storage (implement later)

---

## Security Considerations

### What Supabase Handles

- Password hashing (bcrypt)
- Session management
- SQL injection prevention (parameterized queries)
- HTTPS everywhere

### What We Handle

- Row Level Security (RLS) policies
- Rate limiting (our code)
- Input validation (our code)
- Keeping dependencies updated

### Row Level Security Example

```sql
-- Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid() = user_id);

-- Users can only create bookmarks for themselves
CREATE POLICY "Users can create own bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## Next Steps

1. Create Supabase project
2. Set up Vercel project (connect to GitHub)
3. Configure environment variables
4. Initialize Expo project with EAS
5. Set up Apple Developer and Google Play accounts
