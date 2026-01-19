# Supabase Email Template Configuration

This guide shows how to customize the password reset email template in Supabase to match the Dystopian Outcasts Wiki brand.

## Accessing Email Templates

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **dystopianoutcasts.wiki**
3. Navigate to: **Authentication** → **Email Templates**
4. Select: **Reset Password** template

## Configuration

### 1. Redirect URL Configuration

In the "Reset Password" template settings:

**For Local Development:**
```
http://localhost:5173/reset-password
```

**For Production:**
```
https://dystopianoutcasts.wiki/reset-password
```

### 2. Custom Email Template (HTML)

Replace the default template with this branded version:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Dystopian Outcasts</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0a0a0a;
      color: #e5e5e5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 10px 0;
    }
    .subtitle {
      font-size: 16px;
      color: #a0a0a0;
      margin: 0;
    }
    .content {
      background-color: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 40px 30px;
      margin-bottom: 30px;
    }
    .greeting {
      font-size: 18px;
      color: #ffffff;
      margin: 0 0 20px 0;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #c0c0c0;
      margin: 0 0 30px 0;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #d4782c;
      color: #ffffff;
      text-decoration: none;
      font-size: 16px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }
    .button:hover {
      background-color: #e08940;
    }
    .warning {
      background-color: rgba(255, 107, 107, 0.15);
      border: 1px solid rgba(255, 107, 107, 0.4);
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .warning-text {
      font-size: 14px;
      color: #ff6b6b;
      margin: 0;
    }
    .expiry {
      font-size: 14px;
      color: #808080;
      margin: 20px 0 0 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #606060;
    }
    .footer a {
      color: #d4782c;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .divider {
      height: 1px;
      background-color: #2a2a2a;
      margin: 30px 0;
    }
    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px 15px;
      }
      .content {
        padding: 30px 20px;
      }
      .title {
        font-size: 20px;
      }
      .greeting {
        font-size: 16px;
      }
      .message {
        font-size: 14px;
      }
      .button {
        padding: 12px 24px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="https://dystopianoutcasts.wiki/assets/branding/benny/benny-512.png" alt="Dystopian Outcasts" class="logo">
      <h1 class="title">Dystopian Outcasts Wiki</h1>
      <p class="subtitle">Project Zomboid Modding Community</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <p class="greeting">Hi there,</p>

      <p class="message">
        We received a request to reset your password for your Dystopian Outcasts Wiki account.
        Click the button below to create a new password.
      </p>

      <div class="button-container">
        <a href="{{ .ConfirmationURL }}" class="button">Reset Your Password</a>
      </div>

      <p class="expiry">
        This link will expire in <strong>60 minutes</strong> for security reasons.
      </p>

      <div class="divider"></div>

      <div class="warning">
        <p class="warning-text">
          <strong>⚠️ Didn't request this?</strong><br>
          If you didn't ask to reset your password, you can safely ignore this email.
          Your password will remain unchanged.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        Need help? Contact us at
        <a href="mailto:dystopianoutcasts@gmail.com">dystopianoutcasts@gmail.com</a>
      </p>
      <p style="margin-top: 10px;">
        <a href="https://dystopianoutcasts.wiki">dystopianoutcasts.wiki</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        © 2026 Dystopian Outcasts. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
```

## Plain Text Version

Also update the plain text version for email clients that don't support HTML:

```
Dystopian Outcasts Wiki - Password Reset Request

Hi there,

We received a request to reset your password for your Dystopian Outcasts Wiki account.

Reset your password by clicking this link:
{{ .ConfirmationURL }}

This link will expire in 60 minutes for security reasons.

DIDN'T REQUEST THIS?
If you didn't ask to reset your password, you can safely ignore this email. Your password will remain unchanged.

---

Need help? Contact us at dystopianoutcasts@gmail.com
Visit us: https://dystopianoutcasts.wiki

© 2026 Dystopian Outcasts. All rights reserved.
```

## Template Variables

Supabase provides these variables you can use:

- `{{ .ConfirmationURL }}` - The password reset link
- `{{ .Token }}` - The reset token (if you want to build custom URL)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - The redirect URL after reset
- `{{ .Email }}` - User's email (optional to include)
- `{{ .Data }}` - Custom data (if you pass any)

## Testing the Email

After configuring:

1. Go to your local site: http://localhost:5173
2. Click "Log In" → "Forgot Password?"
3. Enter a test email address
4. Check your inbox for the branded email
5. Click the reset link to verify it works

## Production Checklist

Before deploying to production:

- [ ] Update redirect URL to `https://dystopianoutcasts.wiki/reset-password`
- [ ] Replace logo URL if hosting locally
- [ ] Test with real email account
- [ ] Verify all links work correctly
- [ ] Check mobile rendering
- [ ] Confirm email doesn't land in spam

## Email Service Provider Settings

**SMTP Configuration** (if using custom provider):
- Go to: **Project Settings** → **Auth** → **SMTP Settings**
- Configure your SMTP provider (e.g., SendGrid, AWS SES, Mailgun)

**Default Supabase Email:**
- Works out of the box
- Sent from `noreply@mail.app.supabase.io`
- May land in spam for some providers

**Custom Domain Email (Recommended for Production):**
- Use a service like SendGrid or AWS SES
- Configure SPF, DKIM, and DMARC records
- Use `noreply@dystopianoutcasts.wiki` for better deliverability

## Branding Assets

**Logo:**
- Current: `/assets/branding/benny/benny-512.png`
- Hosted at: `https://dystopianoutcasts.wiki/assets/branding/benny/benny-512.png`

**Colors:**
- Primary Orange: `#d4782c`
- Background: `#0a0a0a`
- Surface: `#1a1a1a`
- Border: `#2a2a2a`
- Text Primary: `#ffffff`
- Text Secondary: `#c0c0c0`

## Additional Email Templates

You may also want to customize:

1. **Confirm Signup** - When email verification is enabled
2. **Magic Link** - For passwordless login
3. **Change Email** - When user updates email
4. **Invite User** - For team invitations (if applicable)

Navigate to each template and apply similar branding.
