# Phase 2 Setup Guide - Authentication & User Features

This guide walks through setting up authentication and user features for the Dystopian Outcasts Wiki.

## Prerequisites

- [x] Phase 1 completed (Supabase backend running with data)
- [x] React Query hooks implemented
- [x] ApiService facade created
- [ ] Environment variables configured
- [ ] Supabase OAuth providers configured

## Environment Setup

### 1. Configure Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cd packages/web
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

**⚠️ Important:**
- The `anon` key is safe to expose in frontend code
- **NEVER** use the `service_role` key in frontend code
- Add `.env` to `.gitignore` (should already be there)

## Configure OAuth Providers

### 2.1 Enable Email/Password Authentication

Email/password auth is enabled by default in Supabase.

**Test it:**
1. Run your app: `npm run dev`
2. Click "Log In" in header
3. Try to sign up with an email

### 2.2 Configure Discord OAuth

**Step 1: Create Discord Application**

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name it "Dystopian Outcasts Wiki" (or similar)
4. Go to **OAuth2** → **General**
5. Add redirect URL:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
6. Copy **Client ID** and **Client Secret**

**Step 2: Configure in Supabase**

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Discord** and click **Enable**
3. Paste:
   - **Discord Client ID**
   - **Discord Client Secret**
4. Click **Save**

### 2.3 Configure Google OAuth

**Step 1: Create Google OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

**Step 2: Configure in Supabase**

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. Paste:
   - **Google Client ID**
   - **Google Client Secret**
4. Click **Save**


## Site URL Configuration

Set your production and development URLs in Supabase:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs** (comma-separated):
   ```
   http://localhost:5173,
   http://localhost:5173/**,
   https://your-domain.com,
   https://your-domain.com/**
   ```

## Testing Authentication

### 1. Test Email/Password

```bash
# Start dev server
npm run dev
```

1. Click **Log In** in header
2. Switch to **Sign Up** tab
3. Enter email and password (min 6 characters)
4. Submit form
5. Check your email for confirmation (if email confirmation is enabled)
6. Once logged in, you should see your avatar/initials in header

### 2. Test OAuth Providers

1. Click **Log In**
2. Click **Continue with Discord** (or Google/GitHub)
3. Authorize the app
4. You should be redirected back and logged in

### 3. Test Bookmarks

1. Make sure you're logged in
2. Navigate to any article
3. Click the **Bookmark** button in article header
4. Button should turn blue and say "Bookmarked"
5. Navigate away and come back - bookmark should persist
6. Click again to remove bookmark

### 4. Test User Menu

1. Click your avatar in the header
2. Dropdown should appear with:
   - Your email
   - Bookmarks link
   - Settings link
   - Sign Out button
3. Click **Sign Out** - you should be logged out

## Implemented Features

### ✅ Authentication
- [x] Email/password login
- [x] Email/password signup
- [x] OAuth login (Discord, Google, GitHub)
- [x] Session persistence
- [x] Auto-refresh tokens
- [x] Sign out

### ✅ UI Components
- [x] `AuthButton` - Login button in header
- [x] `LoginModal` - Login/signup modal
- [x] `UserMenu` - User dropdown menu
- [x] `BookmarkButton` - Bookmark toggle on articles

### ✅ Context & Hooks
- [x] `AuthContext` - Global auth state
- [x] `useAuth()` hook - Access auth state anywhere
- [x] React Query hooks for bookmarks
- [x] Optimistic updates

### ✅ Integration
- [x] Auth provider wrapped around app
- [x] AuthButton in header
- [x] Bookmark button on article pages
- [x] Protected features (require login)

## Next Steps (Phase 2 Remaining)

### User Pages

1. **Bookmarks Page** (`/bookmarks`)
   - List all user's bookmarked articles
   - Remove bookmarks
   - Filter by category/section

2. **Settings Page** (`/settings`)
   - Change display name
   - Update email
   - Change password
   - Delete account

3. **Reading Progress**
   - Auto-save scroll position
   - "Resume reading" feature
   - Progress indicators

### Deployment

1. **Environment Variables**
   - Add to Vercel/Netlify
   - Test in production build

2. **CORS Configuration**
   - Verify Supabase allows your domain
   - Test OAuth redirects in production

3. **Testing Checklist**
   - [ ] All pages load from Supabase
   - [ ] Search works
   - [ ] Email login works
   - [ ] All OAuth providers work
   - [ ] Bookmarks sync across sessions
   - [ ] Mobile responsive
   - [ ] Dark/light theme works

## Troubleshooting

### "Missing Supabase environment variables"

**Problem:** App crashes on startup

**Solution:**
1. Make sure `.env` file exists in `packages/web/`
2. Check variable names are exactly:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Restart dev server after changing `.env`

### OAuth redirect fails

**Problem:** After clicking OAuth button, redirect fails

**Solution:**
1. Check redirect URL in OAuth provider matches:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
2. Check Site URL in Supabase includes your domain
3. Make sure OAuth provider is enabled in Supabase

### "User already registered"

**Problem:** Can't sign up with email

**Solution:**
- Email might already be in use
- Check Supabase Dashboard → **Authentication** → **Users**
- Delete the user if testing, or use different email

### Bookmark doesn't persist

**Problem:** Bookmark disappears after refresh

**Solution:**
1. Check you're logged in
2. Open browser console for errors
3. Verify RLS policies in Supabase:
   ```sql
   SELECT * FROM bookmarks WHERE user_id = 'YOUR-USER-ID';
   ```

## Architecture Summary

```
User clicks "Log In"
    ↓
LoginModal opens
    ↓
User enters email/password OR clicks OAuth
    ↓
AuthContext.signIn() / signInWithOAuth()
    ↓
ApiService.signIn() / signInWithOAuth()
    ↓
Supabase Auth
    ↓
Session created
    ↓
AuthContext updates (user, session)
    ↓
UI updates (UserMenu appears, AuthButton changes)
    ↓
User can now bookmark articles, save progress
```

## Files Created/Modified

### New Files
- `packages/web/src/context/AuthContext.tsx`
- `packages/web/src/components/auth/AuthButton.tsx`
- `packages/web/src/components/auth/LoginModal.tsx`
- `packages/web/src/components/auth/UserMenu.tsx`
- `packages/web/src/components/article/BookmarkButton.tsx`
- `packages/web/src/styles/components/auth-button.css`
- `packages/web/src/styles/components/login-modal.css`
- `packages/web/src/styles/components/user-menu.css`
- `packages/web/src/styles/components/bookmark-button.css`

### Modified Files
- `packages/web/src/App.tsx` - Added AuthProvider
- `packages/web/src/components/layout/Header.tsx` - Added AuthButton
- `packages/web/src/components/wiki/WikiArticle.tsx` - Added BookmarkButton
- `packages/web/src/styles/components/wiki-article.css` - Title row layout

## Support

- Supabase Docs: https://supabase.com/docs/guides/auth
- React Query Docs: https://tanstack.com/query/latest
- GitHub Issues: https://github.com/your-repo/issues
