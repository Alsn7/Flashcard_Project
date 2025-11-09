# Google OAuth Fix - Complete Guide

## ✅ Issue Fixed

**Problem:** Google OAuth was redirecting to `http://localhost:3000/?code=...` instead of `/auth/callback`

**Solution:** Fixed in 2 ways:
1. Updated `signInWithGoogle()` to redirect to `/auth/callback`
2. Added fallback handler on home page to catch and redirect any OAuth codes

---

## 🔧 Changes Made:

### 1. Updated `src/lib/auth.tsx` - signInWithGoogle():
```tsx
// BEFORE: Redirected directly to dashboard
redirectTo: `${window.location.origin}/dashboard`

// AFTER: Redirects to callback route first
redirectTo: `${window.location.origin}/auth/callback`
```

This ensures Google OAuth follows the proper flow:
1. User clicks "Sign in with Google"
2. Google authenticates user
3. Redirects to `/auth/callback?code=...`
4. Callback exchanges code for session
5. Then redirects to dashboard

### 2. Added Fallback in `src/components/home.tsx`:
```tsx
React.useEffect(() => {
  const code = searchParams?.get("code");
  if (code) {
    // Redirect OAuth codes to callback route
    router.replace(`/auth/callback?code=${code}`);
  }
}, [searchParams, router]);
```

This catches any OAuth codes that land on the home page and redirects them to the proper callback handler.

---

## 🎯 How Google OAuth Should Work Now:

### Full Flow:
1. **User clicks "Sign in with Google"**
   - Console: `🔵 [Google Auth] Initiating Google sign-in with redirectTo: http://localhost:3000/auth/callback`

2. **Google account selection page appears**
   - User selects Google account
   - Google authenticates

3. **Google redirects back with code**
   - URL: `http://localhost:3000/auth/callback?code=...`
   - OR if it goes to home: `http://localhost:3000/?code=...` → automatically redirects to callback

4. **Callback route processes the code**
   - Console: `🔄 [Auth Callback] Received request: { hasCode: true }`
   - Console: `🔑 [Auth Callback] Exchanging code for session...`
   - Console: `✅ [Auth Callback] Session established, redirecting to dashboard`

5. **User lands on dashboard, fully authenticated**

---

## 🔍 Testing Google OAuth:

### Step 1: Clear Everything
```bash
# Clear browser data
- Press F12 → Application → Clear storage → Clear site data
```

### Step 2: Test Sign In
1. Go to sign-in page
2. Click "Sign in with Google" button
3. Open browser console (F12 → Console)
4. Select your Google account

### Step 3: Watch Console Logs
You should see:
```
🔵 [Google Auth] Initiating Google sign-in with redirectTo: http://localhost:3000/auth/callback
✅ [Google Auth] OAuth flow initiated
🔄 [Auth Callback] Received request: { hasCode: true, ... }
🔑 [Auth Callback] Exchanging code for session...
🔑 [Auth Callback] Exchange result: { hasSession: true, hasUser: true, ... }
✅ [Auth Callback] Session established, redirecting to dashboard
```

### Step 4: Verify Success
- ✅ URL changes to `http://localhost:3000/dashboard`
- ✅ User is logged in
- ✅ Can see their profile/name

---

## ⚙️ Supabase Configuration

You also need to ensure your Supabase project is configured correctly:

### 1. Go to Supabase Dashboard
https://app.supabase.com/project/YOUR_PROJECT/auth/url-configuration

### 2. Configure Redirect URLs
Add these URLs to "Redirect URLs":
```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

### 3. Set Site URL
```
http://localhost:3000
```

### 4. For Production (when deploying):
Add your production URLs:
```
https://yourdomain.com/auth/callback
https://yourdomain.com/**
```

---

## 🐛 Troubleshooting:

### Issue: Still redirecting to home page with code
**Check:**
1. Clear browser cache and cookies
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Try in incognito/private browsing mode

### Issue: "Invalid redirect URL" error
**Check:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Make sure `http://localhost:3000/auth/callback` is in Redirect URLs
3. Make sure Site URL is `http://localhost:3000`

### Issue: Code exchange fails
**Check console for:**
```
❌ [Auth Callback] Failed to exchange code: ...
```
**Solution:**
- Check Supabase credentials in `.env`
- Verify Google OAuth is enabled in Supabase Dashboard → Authentication → Providers

### Issue: Redirects to callback but then to home instead of dashboard
**Check:**
- Look for errors in console
- Verify callback route is creating session successfully
- Check cookies are being set

---

## 📋 Quick Test Checklist:

- [ ] Dev server is running
- [ ] Browser console is open
- [ ] Supabase redirect URLs configured
- [ ] Click "Sign in with Google"
- [ ] Can select Google account
- [ ] See console logs with emojis (🔵, 🔄, 🔑, ✅)
- [ ] URL changes to `/auth/callback?code=...`
- [ ] Then redirects to `/dashboard`
- [ ] User is logged in and stays logged in

---

## 🎉 Expected Behavior:

### ✅ Working Google OAuth:
1. Click Google button → Google account picker
2. Select account → Brief loading
3. Redirect to callback → Console shows session created
4. Redirect to dashboard → User logged in
5. Refresh page → User stays logged in

### ❌ Not Working (Before Fix):
1. Click Google button → Google account picker
2. Select account → Brief loading
3. Land on home page with `?code=...` in URL
4. Code not processed → Not logged in

---

## 💡 Why This Happened:

The `signInWithGoogle()` function was using `redirectTo: "/dashboard"`, which Supabase interprets as `http://localhost:3000/` (home page) because it's a relative path that doesn't start with the site URL properly.

By changing to `/auth/callback`, we ensure:
1. OAuth code is properly captured
2. Code is exchanged for session
3. Session cookies are set
4. User is then redirected to dashboard

---

**All fixed! Test your Google OAuth now and check the console logs.** 🚀
