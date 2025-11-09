# Email/Password Authentication Troubleshooting Guide

## Issue: Email/Password Authentication Not Working

### Debug Steps Added:

1. **Console Logging Enabled**
   - All authentication operations now log to browser console
   - Look for these prefixes:
     - 🔐 [SignIn] - Sign in operations
     - 📝 [SignUp] - Sign up operations  
     - 🔄 [Auth Callback] - Email verification callback
     - ✅ Success indicators
     - ❌ Error indicators

### How to Diagnose the Issue:

#### Step 1: Open Browser Console
- Open your browser's Developer Tools (F12)
- Go to the Console tab
- Clear the console before testing

#### Step 2: Test Sign Up
1. Try to sign up with a new email
2. Check console for:
   ```
   📝 [SignUp] Attempting sign up: { email, fullName, redirectTo }
   📝 [SignUp] Response: { hasUser, userId, hasSession, emailConfirmed, ... }
   ```
3. **Expected outcomes:**
   - **If email confirmation is ENABLED in Supabase:**
     - `hasUser: true`
     - `userId: <some-id>`
     - `hasSession: false`
     - `emailConfirmed: null`
     - You should see: "✉️ [SignUp] Email confirmation required"
     - Signup success screen should appear
   
   - **If email confirmation is DISABLED in Supabase:**
     - `hasUser: true`
     - `userId: <some-id>`
     - `hasSession: true`
     - `emailConfirmed: <timestamp>`
     - You should see: "✅ [SignUp] User signed up and automatically signed in"
     - Should redirect to dashboard

#### Step 3: Test Sign In
1. Try to sign in with existing credentials
2. Check console for:
   ```
   🔐 [SignIn] Attempting sign in with email: <email>
   🔐 [SignIn] Response: { hasSession, hasUser, emailConfirmed, error }
   ```
3. **Expected outcomes:**
   - **Success:** `hasSession: true`, redirects to dashboard
   - **Wrong password:** Error message shown
   - **Email not confirmed:** Error message: "Please check your email and click the verification link"

#### Step 4: Check Email Verification Link
1. Click the verification link in email
2. Should redirect to: `http://localhost:3000/auth/callback?code=...`
3. Check console for:
   ```
   🔄 [Auth Callback] Received request: { hasCode: true, ... }
   🔑 [Auth Callback] Exchanging code for session...
   🔑 [Auth Callback] Exchange result: { hasSession, hasUser, emailConfirmed }
   ✅ [Auth Callback] Session established, redirecting to dashboard
   ```

### Common Issues and Solutions:

#### Issue 1: No User Created in Supabase
**Symptom:** Console shows `hasUser: false` after signup
**Causes:**
- Invalid Supabase credentials in .env
- Supabase project is paused or deleted
- Network connectivity issues

**Solution:**
1. Check `.env` file has correct values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Restart dev server after changing .env: `npm run dev`
3. Check Supabase Dashboard → Authentication → Users

#### Issue 2: No Verification Email Sent
**Symptom:** User created but no email received
**Causes:**
- Email confirmation is disabled in Supabase
- SMTP not configured in Supabase
- Email is in spam folder
- Rate limiting (too many emails sent)

**Solution:**
1. **Check Supabase Email Settings:**
   - Dashboard → Authentication → Providers → Email
   - "Confirm email" should be toggled ON
   - Check "Email Templates" are configured

2. **Check SMTP Settings:**
   - Dashboard → Project Settings → Auth
   - "Enable Custom SMTP" if using custom email provider
   - Test by sending a test email from dashboard

3. **Check Redirect URLs:**
   - Dashboard → Authentication → URL Configuration
   - Add: `http://localhost:3000/**`
   - Add: `http://localhost:3000/auth/callback`

#### Issue 3: Verification Link Doesn't Work
**Symptom:** Clicking email link shows error
**Causes:**
- Wrong redirect URL in Supabase
- Callback route has errors
- Session not persisting

**Solution:**
1. Check console logs in callback route
2. Verify redirect URL matches your site URL
3. Clear browser cookies and local storage
4. Try in incognito mode

#### Issue 4: "Invalid login credentials" Error
**Symptom:** Can't sign in even with correct password
**Causes:**
- Email not verified yet
- User doesn't exist in database
- Wrong password

**Solution:**
1. Check if email verification is required
2. Look for specific error in console logs
3. Try password reset flow
4. Check Supabase Dashboard → Authentication → Users to see user status

#### Issue 5: Session Not Persisting After Email Verification
**Symptom:** Redirects to dashboard but immediately logs out
**Causes:**
- Cookies not being set
- PKCE flow misconfiguration
- Browser blocking cookies

**Solution:**
1. Check browser console for cookie warnings
2. Clear browser cache and cookies
3. Ensure site is accessed via http://localhost:3000 (not 127.0.0.1)
4. Check callback route is setting cookies properly

### Configuration Checklist:

#### Supabase Dashboard Settings:
- [ ] Authentication → Providers → Email is enabled
- [ ] "Confirm email" is toggled appropriately (ON or OFF)
- [ ] Email templates are configured
- [ ] URL Configuration includes:
  - [ ] Site URL: `http://localhost:3000`
  - [ ] Redirect URLs: `http://localhost:3000/**`
  - [ ] Redirect URLs: `http://localhost:3000/auth/callback`

#### Local Environment:
- [ ] `.env` file exists with correct Supabase credentials
- [ ] Dev server restarted after .env changes
- [ ] Browser console shows no CORS errors
- [ ] No firewall blocking Supabase API

### Testing Checklist:

1. **Sign Up Flow:**
   - [ ] Can submit signup form
   - [ ] See success screen with email
   - [ ] User appears in Supabase Dashboard
   - [ ] Email received (if confirmation enabled)
   - [ ] Can click resend verification

2. **Email Verification Flow (if enabled):**
   - [ ] Email contains clickable link
   - [ ] Link redirects to localhost:3000/auth/callback
   - [ ] Console shows successful session exchange
   - [ ] Redirects to dashboard
   - [ ] User stays logged in

3. **Sign In Flow:**
   - [ ] Can enter email and password
   - [ ] Correct password signs in successfully
   - [ ] Wrong password shows error
   - [ ] Unverified email shows appropriate error
   - [ ] Redirects to dashboard on success

### Advanced Debugging:

#### Check Supabase Logs:
1. Go to Supabase Dashboard → Logs → Auth Logs
2. Look for recent sign up/sign in attempts
3. Check for error messages

#### Network Tab Analysis:
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `supabase.co`
4. Check request/response for errors

#### Test with Supabase SQL Editor:
```sql
-- Check if users are being created
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check user identities
SELECT user_id, provider, created_at 
FROM auth.identities 
ORDER BY created_at DESC 
LIMIT 10;
```

### Still Having Issues?

If none of the above helps, share:
1. Complete console logs from signup/signin attempt
2. Screenshot of Supabase Auth settings
3. Network tab showing failed requests
4. User record from Supabase Dashboard
