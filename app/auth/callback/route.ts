import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");
  const type = requestUrl.searchParams.get("type"); // "recovery" for password reset
  const origin = requestUrl.origin;

  console.log('🔄 [Auth Callback] Received request:', {
    hasCode: !!code,
    type,
    error,
    error_description,
    origin,
    fullUrl: request.url
  });

  // Handle errors from Supabase
  if (error) {
    console.error('❌ [Auth Callback] Error from Supabase:', error, error_description);
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error_description || error)}`
    );
  }

  // For password recovery, hash fragments are used (client-side only)
  // Just redirect to home page and let the PasswordRecoveryHandler process it
  // The hash will be preserved in the redirect
  if (!code) {
    console.log('⚠️ [Auth Callback] No code in query, might be hash-based auth, redirecting to home');
    return NextResponse.redirect(origin);
  }

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    try {
      console.log('🔑 [Auth Callback] Exchanging code for session...');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('🔑 [Auth Callback] Exchange result:', {
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        email: data?.user?.email,
        emailConfirmed: data?.user?.email_confirmed_at,
        error: exchangeError?.message
      });

      if (exchangeError) {
        console.error('❌ [Auth Callback] Failed to exchange code:', exchangeError);
        return NextResponse.redirect(
          `${origin}/?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data?.session) {
        const user = data.user;
        
        console.log('🔑 [Auth Callback] Session details:', {
          hasUser: !!user,
          type: type,
          aud: user?.aud,
          email: user?.email,
        });

        // ALWAYS redirect to update password view for password recovery
        // Check multiple conditions to ensure we catch recovery flows
        const isRecovery = type === 'recovery' || 
                          requestUrl.searchParams.has('type') ||
                          requestUrl.toString().includes('type=recovery');
        
        if (isRecovery) {
          console.log('🔐 [Auth Callback] PASSWORD RECOVERY DETECTED - Forcing update password view');
          // Set a cookie to mark this as recovery mode
          const response = NextResponse.redirect(`${origin}/?view=update-password`);
          response.cookies.set('recovery-mode', 'true', {
            path: '/',
            maxAge: 300, // 5 minutes
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          });
          return response;
        }
        
        console.log('✅ [Auth Callback] Normal auth flow, redirecting to dashboard');
        // Session was successfully created, redirect to dashboard
        return NextResponse.redirect(`${origin}/dashboard`);
      } else {
        console.warn('⚠️ [Auth Callback] No session created after exchange');
      }
    } catch (err) {
      console.error('❌ [Auth Callback] Exception during code exchange:', err);
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent('Failed to establish session')}`
      );
    }
  }

  console.log('⚠️ [Auth Callback] No code provided, redirecting to home');
  // No code provided, redirect to home
  return NextResponse.redirect(origin);
}
