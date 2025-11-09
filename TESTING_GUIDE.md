# Quick Test Guide - Email/Password Authentication

## What I Fixed:

### 1. ✅ Enhanced Debug Logging
- Added comprehensive console logging throughout the authentication flow
- All auth operations now show detailed information in browser console
- Easy to track where issues occur

### 2. ✅ Improved Error Handling
- Better error messages for all authentication failures
- Callback route now handles errors gracefully
- Logs show exact failure points

### 3. ✅ Fixed Session Management
- Updated callback route to properly set cookies
- Session now persists after email verification
- PKCE flow properly configured

### 4. ✅ Better UI Feedback
- Console logs in UI components
- Clear success/error indicators
- Improved signup success screen

## How to Test Now:

### Step 1: Open Browser Console
Press `F12` → Console tab → Clear console

### Step 2: Test Sign Up
1. Go to your signup page
2. Enter email, password, and name
3. **Watch console for these messages:**
   ```
   📝 [UI] Sign up form submitted: { email, name }
   📝 [SignUp] Attempting sign up: { email, fullName, redirectTo }
   📝 [SignUp] Response: { hasUser, userId, hasSession, emailConfirmed, ... }
   ```

4. **What to check:**
   - `hasUser: true` ← User was created ✅
   - `userId: "uuid"` ← Has a valid ID ✅
   - `hasSession: false` ← Needs email verification (if enabled)
   - OR `hasSession: true` ← Auto sign-in (if email verification disabled)

### Step 3: Check Your Email
- If console shows `emailConfirmed: null`, check your email
- Look for verification email from your Supabase project
- Click the verification link

### Step 4: Verify Email Link Works
1. Click link in email
2. Should redirect to `http://localhost:3000/auth/callback?code=...`
3. **Watch console for:**
   ```
   🔄 [Auth Callback] Received request: { hasCode: true }
   🔑 [Auth Callback] Exchanging code for session...
   🔑 [Auth Callback] Exchange result: { hasSession: true, ... }
   ✅ [Auth Callback] Session established, redirecting to dashboard
   ```

### Step 5: Test Sign In
1. Go to sign in page
2. Enter your verified email and password
3. **Watch console for:**
   ```
   🔐 [UI] Sign in form submitted: { email }
   🔐 [SignIn] Attempting sign in with email: your@email.com
   🔐 [SignIn] Response: { hasSession: true, hasUser: true, ... }
   ✅ [SignIn] Successfully signed in
   ```

## Common Scenarios:

### ✅ Email Confirmation DISABLED (Auto Sign-In)
**Expected flow:**
1. Sign up → Console shows `hasSession: true`
2. Automatically redirected to dashboard
3. No email verification needed

**How to enable this in Supabase:**
- Dashboard → Authentication → Providers → Email
- Toggle OFF "Confirm email"

### 📧 Email Confirmation ENABLED (Manual Verification)
**Expected flow:**
1. Sign up → Console shows `hasSession: false`
2. See signup success screen
3. Check email for verification link
4. Click link → Redirect to dashboard
5. Now can sign in normally

**How to enable this in Supabase:**
- Dashboard → Authentication → Providers → Email
- Toggle ON "Confirm email"

## Troubleshooting Tips:

### If signup shows `hasUser: false`:
❌ **Problem:** User not being created in Supabase
🔧 **Check:**
- `.env` file has correct Supabase credentials
- Restart dev server: Stop terminal (Ctrl+C) → Run `npm run dev`
- Supabase project is not paused

### If no email received:
❌ **Problem:** Email not being sent
🔧 **Check:**
- Supabase Dashboard → Authentication → Providers → Email → "Confirm email" is ON
- Check spam folder
- Supabase Dashboard → Project Settings → Auth → SMTP configured
- Try clicking "Resend verification" button

### If sign in shows error:
❌ **Problem:** Can't sign in with correct password
🔧 **Check console for specific error:**
- "Invalid email or password" → Wrong credentials
- "Please check your email and click the verification link" → Email not verified yet
- Check Supabase Dashboard → Authentication → Users → Find your user → Check "Confirmed" status

### If verification link doesn't work:
❌ **Problem:** Callback fails
🔧 **Check:**
- Console shows `🔄 [Auth Callback]` logs
- Look for error messages in console
- Supabase Dashboard → Authentication → URL Configuration:
  - Site URL: `http://localhost:3000`
  - Redirect URLs includes: `http://localhost:3000/**`

## Quick Fixes:

### Clear Everything and Start Fresh:
1. Clear browser cookies and local storage (F12 → Application tab)
2. Go to Supabase Dashboard → Authentication → Users
3. Delete test users
4. Try signup again with fresh email

### Restart Dev Server:
```bash
# Stop server (Ctrl+C in terminal)
npm run dev
```

### Check Environment Variables:
Open `.env` file and verify:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## What to Share If Still Not Working:

Please copy and share:
1. **Console logs** from signup attempt (all 📝 [SignUp] messages)
2. **Console logs** from signin attempt (all 🔐 [SignIn] messages)
3. **Screenshot** of Supabase Dashboard → Authentication → Providers → Email settings
4. **User status** from Supabase Dashboard → Authentication → Users
5. Any **error messages** you see in the UI

## Testing Checklist:

- [ ] Dev server is running
- [ ] Browser console is open
- [ ] .env file has correct values
- [ ] Supabase project is active
- [ ] Email provider is configured (if email verification enabled)
- [ ] Can see console logs with emoji prefixes (🔐, 📝, 🔄)
- [ ] Signup creates user in Supabase Dashboard
- [ ] Can receive and click verification email (if enabled)
- [ ] Can sign in after verification
- [ ] Session persists after sign in

---

**Note:** Google Auth works, so Supabase connection is good! The issue is specifically with email/password flow. Follow the console logs to see where it breaks.
