# Rate Limiting Strategy

## Overview

Rate limiting prevents abuse (scrapers, attacks) while allowing legitimate use, including AI assistants helping people mod games.

## Our Philosophy

> "Be useful enough that scraping feels pointless."

We're NOT trying to block AI/LLMs. We want them to be able to help users who are modding. We just don't want someone to bulk-download our entire wiki in seconds.

---

## Rate Limits by User Type

| User Type | Limit | Requests/Hour | Use Case |
|-----------|-------|---------------|----------|
| **Anonymous** | 10/min | 600/hour | Casual browsing, AI assistants |
| **Registered** | 60/min | 3,600/hour | Active users, power users |
| **Premium** (future) | 120/min | 7,200/hour | API access, tool developers |

---

## What This Means in Practice

### For Someone Browsing Normally

```
Opens wiki → clicks article → reads → clicks another → searches

Typical usage: 2-5 requests per minute
Limit: 10/min (anonymous) or 60/min (registered)

Result: Never hits the limit
```

### For an AI Assistant (ChatGPT, Claude, etc.)

```
User asks: "How do I add weapon repair in PZ?"
AI searches wiki → gets 1-2 articles → answers user

Typical usage: 2-3 requests per query
Limit: 10/min (anonymous)

Result: Works fine, can help many users
```

### For Someone Trying to Scrape Everything

```
Bot tries to download all ~500 articles

At 10/min (anonymous): 50+ minutes minimum
At 60/min (registered): ~10 minutes, but we have their email

Plus: They'd need to re-scrape for updates
Plus: We can see the pattern and block if needed
```

---

## Implementation

### Where Rate Limiting Happens

```
┌─────────────────────────────────────────────────────────────┐
│                     REQUEST FLOW                             │
│                                                              │
│   Incoming Request                                           │
│         │                                                    │
│         ▼                                                    │
│   ┌─────────────────┐                                       │
│   │   CLOUDFLARE    │  ✗ No rate limiting here (free tier)  │
│   │   (Free Tier)   │  ✓ DDoS protection (free)             │
│   └────────┬────────┘  ✓ Caching (free)                     │
│            │                                                 │
│            ▼                                                 │
│   ┌─────────────────┐                                       │
│   │    SUPABASE     │  ✓ Our rate limiting lives here       │
│   │  Edge Function  │                                        │
│   └────────┬────────┘                                       │
│            │                                                 │
│       Over limit?                                            │
│       ┌────┴────┐                                           │
│      Yes       No                                            │
│       │         │                                            │
│       ▼         ▼                                            │
│   ┌───────┐ ┌─────────┐                                     │
│   │  429  │ │ Process │                                     │
│   │ Error │ │ Request │                                     │
│   └───────┘ └─────────┘                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Supabase Edge Function (Pseudocode)

```typescript
// middleware/rateLimit.ts

const RATE_LIMITS = {
  anonymous: { requests: 10, window: 60 },    // 10 per minute
  registered: { requests: 60, window: 60 },   // 60 per minute
  premium: { requests: 120, window: 60 },     // 120 per minute
};

export async function rateLimit(request: Request) {
  // Get user identity
  const userId = await getUserId(request);  // From auth token
  const userType = await getUserType(userId); // anonymous, registered, premium
  const clientIP = request.headers.get('cf-connecting-ip');

  // Use userId if logged in, IP if anonymous
  const identifier = userId || clientIP;
  const limit = RATE_LIMITS[userType];

  // Count recent requests (stored in Supabase)
  const recentCount = await countRecentRequests(identifier, limit.window);

  if (recentCount >= limit.requests) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: 60,
      limit: limit.requests,
      remaining: 0,
    }), {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': limit.requests.toString(),
        'X-RateLimit-Remaining': '0',
      }
    });
  }

  // Log this request
  await logRequest(identifier);

  // Continue to actual handler
  return null; // No rate limit hit
}
```

### Request Counting (PostgreSQL)

```sql
-- Table to track requests
CREATE TABLE request_log (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,        -- User ID or IP address
  endpoint TEXT,                   -- Which API endpoint
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_request_log_lookup
ON request_log (identifier, created_at DESC);

-- Function to count recent requests
CREATE FUNCTION count_recent_requests(
  p_identifier TEXT,
  p_window_seconds INT
) RETURNS INT AS $$
  SELECT COUNT(*)::INT
  FROM request_log
  WHERE identifier = p_identifier
    AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;
$$ LANGUAGE SQL;

-- Cleanup old entries (run periodically)
CREATE FUNCTION cleanup_old_requests() RETURNS void AS $$
  DELETE FROM request_log
  WHERE created_at < NOW() - INTERVAL '1 hour';
$$ LANGUAGE SQL;
```

---

## Response Headers

We include rate limit info in responses so clients can behave nicely:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705612800
```

When rate limited:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0

{
  "error": "Rate limit exceeded",
  "message": "You've made too many requests. Please wait 60 seconds.",
  "retryAfter": 60
}
```

---

## Why DIY Instead of Paying Cloudflare?

| Factor | Cloudflare ($20/mo) | DIY ($0) |
|--------|---------------------|----------|
| Blocks at | Edge (before hitting server) | Server (after request arrives) |
| Against massive attacks | Better (absorbs at edge) | Server still processes check |
| User-type awareness | Limited (can't check your auth) | Full (knows registered vs anon) |
| Customization | Rules-based | Full code control |
| Cost | $20/month | $0 |

**For our scale:** DIY is fine. We're not a high-value attack target. If we get big enough to face serious attacks, we can add Cloudflare paid tier then.

---

## Handling Edge Cases

### What if someone creates many accounts?

Each account still has individual rate limits. But if we see suspicious patterns:

```sql
-- Find IPs with many accounts
SELECT client_ip, COUNT(DISTINCT user_id) as accounts
FROM auth_sessions
GROUP BY client_ip
HAVING COUNT(DISTINCT user_id) > 5;
```

We can flag or investigate these.

### What about shared IPs (schools, offices)?

Anonymous rate limiting by IP could affect legitimate users on shared networks. Solutions:

1. **Encourage registration** - Registered users get their own limit
2. **Higher anonymous limit** - 10/min is reasonable for shared use
3. **Monitor and adjust** - If we see complaints, we can whitelist IPs

### What if a legitimate tool needs more access?

Future option: API keys with higher limits for tool developers. This could be:
- Free tier: 60/min (like registered)
- Paid tier: 500/min for $10/month

---

## Monitoring

We should track:

| Metric | Why |
|--------|-----|
| Requests per minute (global) | Spot traffic spikes |
| 429 responses per minute | See how many hit limits |
| Requests by user type | Understand usage patterns |
| Top IPs by request count | Identify potential scrapers |

---

## What We're NOT Doing

| Approach | Why Not |
|----------|---------|
| Blocking AI user agents | We want AI to help modders |
| CAPTCHA on every request | Bad UX |
| Requiring login to browse | Barrier to entry |
| Aggressive IP blocking | Too many false positives |
| Paid tier required for search | Limits discoverability |

---

## Summary

- **Anonymous**: 10 requests/minute (enough to browse, painful to scrape)
- **Registered**: 60 requests/minute (comfortable for power users)
- **Implementation**: Supabase Edge Functions + PostgreSQL
- **Cost**: $0 (DIY beats $20/month Cloudflare)
- **Philosophy**: Welcome AI assistants, discourage bulk scraping
