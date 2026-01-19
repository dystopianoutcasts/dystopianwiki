# Testing Guide - Phase 2 Authentication

Quick guide to test all the authentication features we just built.

## Prerequisites

- [x] Supabase project running
- [x] Environment variables configured in `.env`
- [ ] OAuth providers configured (Discord, Google)
- [ ] App running (`npm run dev`)

## Quick Start

```bash
# Navigate to web package
cd packages/web

# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

---

## Test Checklist

### 1. ✅ Authentication UI

**What to check:**
- [ ] "Log In" button appears in header (top right)
- [ ] Clicking "Log In" opens modal
- [ ] Modal has 2 OAuth buttons (Discord, Google)
- [ ] Modal has email/password form
- [ ] Can switch between "Log In" and "Sign Up" tabs

**Expected behavior:**
- Modal has smooth animations
- All buttons are styled correctly
- Form has proper validation

---

### 2. 📧 Email/Password Signup

**Steps:**
1. Click "Log In" button
2. Click "Sign up" link at bottom
3. Enter email: `test@example.com`
4. Enter password: `password123` (min 6 chars)
5. Click "Sign Up"

**Expected behavior:**
- Loading state shows ("Loading...")
- On success:
  - Modal closes
  - User menu appears in header (avatar with first letter of email)
  - Console shows no errors

**Common issues:**
- **"User already registered"**: Email already in use, try different email
- **"Invalid email"**: Check email format
- **"Password too short"**: Min 6 characters required

---

### 3. 🔑 Email/Password Login

**Steps:**
1. Sign out if logged in (click avatar → Sign Out)
2. Click "Log In" button
3. Enter the email/password you just created
4. Click "Sign In"

**Expected behavior:**
- Loading state shows
- On success:
  - Modal closes
  - User menu appears with your email
  - You're logged in

---

### 4. 👤 User Menu

**Steps:**
1. While logged in, click your avatar in header
2. Dropdown should appear

**Expected behavior:**
- Dropdown shows:
  - Your email address
  - "Bookmarks" link
  - "Settings" link
  - "Sign Out" button
- Clicking "Sign Out" logs you out
- Clicking outside closes dropdown

---

### 5. 🔖 Bookmark Functionality

**Steps:**
1. Make sure you're logged in
2. Navigate to any article (e.g., `/pz/build-41/modding/items/item-guide`)
3. Find "Bookmark" button in article header (next to title)
4. Click it

**Expected behavior:**
- Button changes from "Bookmark" to "Bookmarked"
- Button turns blue/primary color
- Bookmark icon fills in
- Navigate away and back - bookmark persists
- Click again to remove bookmark

**Not logged in:**
- Clicking bookmark shows tooltip: "Sign in to save bookmarks"
- Tooltip disappears after 3 seconds

---

### 6. 🔗 OAuth Login (Discord)

**Prerequisites:**
- Discord OAuth configured in Supabase (see PHASE2_SETUP.md)

**Steps:**
1. Sign out if logged in
2. Click "Log In"
3. Click "Continue with Discord"
4. Authorize the app on Discord

**Expected behavior:**
- Redirects to Discord
- After authorization, redirects back to wiki
- You're logged in
- Avatar shows Discord profile picture
- Email shows Discord email

---

### 7. 🔗 OAuth Login (Google)

**Prerequisites:**
- Google OAuth configured in Supabase

**Steps:**
1. Sign out if logged in
2. Click "Log In"
3. Click "Continue with Google"
4. Select Google account

**Expected behavior:**
- Redirects to Google
- After authorization, redirects back
- You're logged in
- Avatar shows Google profile picture

---

## Browser Console Tests

Open DevTools Console (F12) and check:

### Check Auth State

```javascript
// Should show current session
const { data: { session } } = await window.supabase.auth.getSession()
console.log('Session:', session)

// Should show current user
console.log('User:', session?.user)
```

### Check Bookmarks

```javascript
// Get all bookmarks (requires login)
const { data: bookmarks } = await window.supabase
  .from('bookmarks')
  .select('*')

console.log('My bookmarks:', bookmarks)
```

---

## Mobile Testing

### Responsive Checks

1. **Open DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M or Cmd+Shift+M)
3. **Select mobile device** (iPhone SE, iPad, etc.)

**What to check:**
- [ ] Auth button visible in header
- [ ] User menu dropdown works on mobile
- [ ] Login modal fits on screen
- [ ] OAuth buttons are thumb-friendly
- [ ] Form inputs are properly sized
- [ ] Bookmark button visible on mobile

---

## Common Issues & Fixes

### "Missing Supabase environment variables"

**Fix:**
```bash
# Make sure .env exists
ls packages/web/.env

# Check contents
cat packages/web/.env

# Should show:
# VITE_SUPABASE_URL=https://...
# VITE_SUPABASE_ANON_KEY=...

# Restart dev server after adding
npm run dev
```

### OAuth redirect fails

**Fix:**
1. Check Supabase Dashboard → Authentication → Providers
2. Verify redirect URL matches:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
3. Check Site URL includes your domain

### Bookmarks don't save

**Fix:**
1. Make sure you're logged in
2. Check browser console for errors
3. Verify RLS policies in Supabase:
   - Go to Table Editor → bookmarks
   - Check "Policies" tab
   - Should have policies for INSERT, SELECT, DELETE

### TypeScript errors in IDE

**Fix:**
```bash
# Rebuild types
cd packages/shared
npm run build

cd ../web
npm run build
```

---

## Performance Testing

### Page Load Speed

1. **Open DevTools** → **Network tab**
2. **Disable cache** (checkbox at top)
3. **Refresh page** (Ctrl+R)

**Check:**
- [ ] Initial load < 2 seconds
- [ ] Supabase requests < 500ms
- [ ] No failed requests (red in Network tab)

### Auth State Persistence

1. **Log in**
2. **Close browser completely**
3. **Reopen and navigate to wiki**

**Expected:**
- Still logged in
- No need to log in again
- Session persists across browser restarts

---

## Next Steps After Testing

Once all tests pass:

1. **Configure remaining OAuth providers** (if not done)
2. **Test on different browsers** (Chrome, Firefox, Safari)
3. **Test on real mobile devices**
4. **Deploy to staging/production**
5. **Set up monitoring** (error tracking)

---

## Getting Help

If something isn't working:

1. **Check browser console** for errors
2. **Check Supabase logs** (Dashboard → Logs)
3. **Review PHASE2_SETUP.md** for configuration
4. **Check .env file** has correct values

---

## Success Criteria

Phase 2 is ready for production when:

- [x] All authentication methods work
- [x] OAuth providers configured and tested
- [x] Bookmarks save and persist
- [x] No console errors
- [x] Mobile responsive
- [x] Works in Chrome, Firefox, Safari
- [x] Session persists across browser restarts
- [x] User can sign out successfully
