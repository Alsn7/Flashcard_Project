"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Hero from "./landing/Hero";
import FeaturesGrid from "./features/FeaturesGrid";
import { AuthForm } from "./auth/AuthForm";

const Home = () => {
  const router = useRouter();
  const [view, setView] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    setView(params.get("view"));
    setError(params.get("error"));

    // Check for recovery-mode cookie set by callback route
    const cookies = document.cookie.split(';');
    const recoveryMode = cookies.some(cookie => cookie.trim().startsWith('recovery-mode=true'));
    
    if (recoveryMode) {
      console.log('🔐 [Home] Recovery mode cookie detected, forcing update password view');
      // Clear the cookie
      document.cookie = 'recovery-mode=; path=/; max-age=0';
      // Redirect to update password view
      router.replace('/?view=update-password');
      return;
    }

    // Check for password recovery hash
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if (type === 'recovery' && accessToken) {
        console.log('🔐 [Home] Recovery hash detected, forcing update password view');
        // Clear hash and set view parameter without reload
        const newUrl = '/?view=update-password';
        window.history.replaceState(null, '', newUrl);
        // Force re-render by updating the URL via router
        router.replace(newUrl);
        return;
      }
    }

    // Check if there's an OAuth code in the URL
    const code = params.get("code");
    
    if (code) {
      console.log('🔄 [Home] OAuth code detected, redirecting to callback...');
      // Redirect to the callback route to properly handle the OAuth code
      router.replace(`/auth/callback?code=${code}`);
    }
  }, [router]);

  // Show auth form when there's a view parameter (like update-password)
  if (view) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <AuthForm />
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card p-8 rounded-xl border border-destructive/50 shadow-xl">
          <h2 className="text-2xl font-semibold text-destructive mb-4">Authentication Error</h2>
          <p className="text-muted-foreground mb-6">{decodeURIComponent(error)}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <FeaturesGrid />
    </div>
  );
};

export default Home;
