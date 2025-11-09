"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "./supabase-browser";
import { Session, User, UserIdentity } from "@supabase/supabase-js";

type AuthError = {
  message: string;
  isUserError: boolean; // Distinguishes expected user errors from system errors
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signInWithOtp: (email: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: AuthError }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserIdentities: () => Promise<UserIdentity[]>;
  unlinkIdentity: (identity: UserIdentity) => Promise<void>;
  linkGoogleIdentity: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const supabase = getSupabaseClient();

    // Initialize session synchronously if possible
    const persistedSession = localStorage.getItem('supabase.auth.token');
    if (persistedSession) {
      try {
        const parsed = JSON.parse(persistedSession);
        // Add validation for session expiry with 5 minutes tolerance
        const now = Math.floor(Date.now() / 1000);
        if (parsed.currentSession?.expires_at) {
          const expiresAt = parsed.currentSession.expires_at;
          // Allow for 5 minutes of clock skew
          if (Math.abs(now - expiresAt) <= 300) {
            setSession(parsed.currentSession);
            setUser(parsed.currentSession?.user ?? null);
          } else {
            console.log('Session expired or clock skew detected, fetching fresh session');
          }
        }
      } catch (e) {
        console.warn('Failed to parse persisted session:', e);
      }
    }

    // Get fresh session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Store userId in localStorage for preferences access
      if (session?.user?.id) {
        localStorage.setItem("userId", session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Store userId in localStorage for preferences access
      if (session?.user?.id) {
        localStorage.setItem("userId", session.user.id);
      } else {
        localStorage.removeItem("userId");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: AuthError }> => {
    const supabase = getSupabaseClient();
    console.log('🔐 [SignIn] Attempting sign in with email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('🔐 [SignIn] Response:', { 
      hasSession: !!data?.session, 
      hasUser: !!data?.user,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      emailConfirmed: data?.user?.email_confirmed_at,
      error: error?.message,
      errorStatus: error?.status
    });
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('❌ [SignIn] Handled error:', error);
      }
      // Provide more specific error messages
      // Check both error message and status code for better matching
      const errorMsg = error.message?.toLowerCase() || '';
      
      if (errorMsg.includes('invalid login credentials') || error.status === 400) {
        return { error: { message: 'Invalid email or password. Please check your credentials and try again.', isUserError: true } };
      } else if (errorMsg.includes('email not confirmed') || errorMsg.includes('email_not_confirmed')) {
        return { error: { message: 'Please check your email and click the verification link before signing in.', isUserError: true } };
      } else if (errorMsg.includes('user not found')) {
        return { error: { message: 'No account found with this email address. Please sign up first.', isUserError: true } };
      } else if (errorMsg.includes('too many requests') || error.status === 429) {
        return { error: { message: 'Too many sign-in attempts. Please wait a few minutes before trying again.', isUserError: true } };
      } else {
        return { error: { message: error.message || 'An error occurred during sign in. Please try again.', isUserError: false } };
      }
    }
    
    console.log('✅ [SignIn] Successfully signed in');
    return {};
  };

  const signInWithOtp = async (email: string) => {
    const supabase = getSupabaseClient();
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error?: AuthError }> => {
    const supabase = getSupabaseClient();
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;
    
    console.log('📝 [SignUp] Attempting sign up:', { email, fullName, redirectTo });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectTo,
      },
    });
    
    console.log('📝 [SignUp] Response:', { 
      hasUser: !!data?.user,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      hasSession: !!data?.session,
      emailConfirmed: data?.user?.email_confirmed_at,
      confirmationSentAt: data?.user?.confirmation_sent_at,
      identities: data?.user?.identities?.length,
      identitiesData: data?.user?.identities,
      error: error?.message,
      redirectTo 
    });
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('❌ [SignUp] Handled error:', error);
      }
      // Provide more specific error messages
      const errorMsg = error.message?.toLowerCase() || '';
      
      if (errorMsg.includes('user already registered') || errorMsg.includes('already registered')) {
        return { error: { message: 'An account with this email already exists. Please sign in instead.', isUserError: true } };
      } else if (errorMsg.includes('password') && errorMsg.includes('6 characters')) {
        return { error: { message: 'Password must be at least 6 characters long.', isUserError: true } };
      } else if (errorMsg.includes('invalid') && errorMsg.includes('email')) {
        return { error: { message: 'Please enter a valid email address.', isUserError: true } };
      } else if (errorMsg.includes('signup') && errorMsg.includes('disabled')) {
        return { error: { message: 'Account registration is currently disabled. Please try again later.', isUserError: true } };
      } else {
        return { error: { message: error.message || 'An error occurred during sign up. Please try again.', isUserError: false } };
      }
    }
    
    // Check if the user already exists (Supabase returns user but with no identities for existing users)
    // This is a security feature to prevent email enumeration
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      console.warn('⚠️ [SignUp] User already exists (no identities):', email);
      return { error: { message: 'An account with this email already exists. Please sign in instead.', isUserError: true } };
    }
    
    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at && !data.session) {
      console.log('✉️ [SignUp] Email confirmation required for:', email);
      console.log('📧 [SignUp] User should check their email for verification link');
    } else if (data.session) {
      console.log('✅ [SignUp] User signed up and automatically signed in (email confirmation disabled)');
    }
    
    return {};
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;
    
    console.log('🔵 [Google Auth] Initiating Google sign-in with redirectTo:', redirectTo);
    
    // Force Google to show the account chooser every time by adding
    // the `prompt=select_account` query parameter. This makes the
    // Google account selection dialog appear even for returning users.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        // `queryParams` is passed to the provider's OAuth URL. We add
        // `prompt=select_account` to force the chooser. If you also
        // want to force re-consent, add `consent` here as well.
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('❌ [Google Auth] Handled error:', error);
      }
      // Provide more specific error messages for OAuth
      switch (error.message) {
        case 'OAuth provider not supported':
          throw new Error('Google sign-in is not available. Please use email and password.');
        case 'OAuth flow cancelled':
          throw new Error('Google sign-in was cancelled. Please try again.');
        default:
          throw new Error(error.message || 'An error occurred during Google sign-in. Please try again.');
      }
    }
    
    console.log('✅ [Google Auth] OAuth flow initiated');
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabaseClient();
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?type=recovery`
      : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Redirect to callback with type=recovery parameter
      redirectTo,
    });
    if (error) {
      // Provide more specific error messages
      switch (error.message) {
        case 'Unable to validate email address: invalid format':
          throw new Error('Please enter a valid email address.');
        case 'User not found':
          throw new Error('No account found with this email address.');
        case 'Email rate limit exceeded':
          throw new Error('Too many password reset requests. Please wait before trying again.');
        default:
          throw new Error(error.message || 'An error occurred while sending the reset email. Please try again.');
      }
    }
  };

  const updatePassword = async (newPassword: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      // Provide more specific error messages
      switch (error.message) {
        case 'New password should be different from the old password.':
          throw new Error('Your new password must be different from your current password.');
        case 'Password should be at least 6 characters':
          throw new Error('Password must be at least 6 characters long.');
        default:
          throw new Error(error.message || 'Failed to update password. Please try again.');
      }
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const getUserIdentities = async (): Promise<UserIdentity[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUserIdentities();
    if (error) {
      throw new Error(error.message || 'Failed to fetch user identities');
    }
    return data?.identities || [];
  };

  const unlinkIdentity = async (identity: UserIdentity) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (error) {
      // Provide more specific error messages
      if (error.message.includes('requires at least 2 identities')) {
        throw new Error('Cannot unlink your only authentication method. Please add another sign-in method first.');
      }
      throw new Error(error.message || 'Failed to unlink identity');
    }
  };

  const linkGoogleIdentity = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
    });
    if (error) {
      throw new Error(error.message || 'Failed to link Google account');
    }
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithOtp,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    signOut,
    getUserIdentities,
    unlinkIdentity,
    linkGoogleIdentity,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
