# Mobile Design: Auth Screen

> **Source:** `MOBILE_UI_DESIGN_SYSTEM_V3.md` sections: 7. AUTH SCREEN

## Screen Layout

```
┌─────────────────────────────────┐
│  ◄                              │
├─────────────────────────────────┤
│                                 │
│         DYSTOPIAN               │  ← Logo/branding
│           WIKI                  │
│                                 │
│  ┌────────────┬────────────┐   │
│  │  SIGN IN   │  SIGN UP   │   │  ← Tab toggle
│  └────────────┴────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📧 Email                 │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 🔑 Password          👁️ │   │  ← Show/hide toggle
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │       SIGN IN           │   │  ← Primary button (accent)
│  └─────────────────────────┘   │
│                                 │
│       Forgot password?          │  ← Link
│                                 │
│  ─────── or continue with ───── │
│                                 │
│  ┌───────────┐ ┌───────────┐   │
│  │  Discord  │ │  Google   │   │  ← OAuth buttons
│  └───────────┘ └───────────┘   │
│                                 │
│  By signing in, you agree to   │
│  our Terms and Privacy Policy  │  ← Legal links
│                                 │
└─────────────────────────────────┘
```

---

## Sign In vs Sign Up Tabs

### Sign In Tab

Fields:
- Email
- Password

Actions:
- Sign In (primary button)
- Forgot password? (link)

### Sign Up Tab

Fields:
- Email
- Password
- Confirm Password (Sign Up only)

Actions:
- Create Account (primary button)

---

## Form Fields

### Email Input

```
┌─────────────────────────────┐
│ 📧 Email                    │
└─────────────────────────────┘
```

- Keyboard: email
- Autocomplete: email

### Password Input

```
┌─────────────────────────────┐
│ 🔑 Password             👁️  │
└─────────────────────────────┘
```

- Keyboard: default
- Secure entry: true (toggle with eye icon)
- Autocomplete: password (sign in) / new-password (sign up)

---

## OAuth Buttons

```
┌───────────────────────────────┐
│  🎮  Continue with Discord    │
└───────────────────────────────┘

┌───────────────────────────────┐
│  G   Continue with Google     │
└───────────────────────────────┘
```

Style: Secondary buttons with provider icons/colors.

---

## Validation States

### Field Error

```
┌─────────────────────────────┐
│ 📧 invalid@                 │  ← Red border
└─────────────────────────────┘
  Please enter a valid email     ← Error message below
```

### Form Error (after submit)

```
┌─────────────────────────────┐
│ ⚠️ Invalid email or password │
└─────────────────────────────┘
```

Displayed above the form, dismissable.

---

## Forgot Password Flow

1. Tap "Forgot password?"
2. Navigate to email input screen
3. Enter email → Submit
4. Show confirmation: "Check your email for reset instructions"
5. Deep link in email opens app to password reset screen

---

## Legal Footer

```
By signing in, you agree to our
Terms of Service and Privacy Policy
```

"Terms of Service" and "Privacy Policy" are tappable links that open in browser.

---

## Presentation

- Presented as modal (slide from bottom)
- Can be dismissed with back button or swipe down
- Unauthenticated users can still browse (auth optional for bookmarks)

---

*See also: [Screen: Profile](09-SCREEN-PROFILE.md), [Animations](13-ANIMATIONS.md)*
