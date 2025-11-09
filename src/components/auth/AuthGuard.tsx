"use client";

import { useAuth } from "@/lib/auth";
import { AuthForm } from "./AuthForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated but in password recovery mode
    if (user && session) {
      // Check URL parameters client-side without useSearchParams
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        
        if (view === 'update-password') {
          console.log('🔐 [AuthGuard] Already on update-password view, not redirecting');
          return;
        }

        // Check if there's a recovery hash in the URL
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const type = hashParams.get('type');
          
          if (type === 'recovery') {
            console.log('🔐 [AuthGuard] Recovery mode detected, redirecting to update password');
            router.replace('/?view=update-password');
            return;
          }
        }
      }
    }
  }, [user, session, router]);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <AuthForm />
      </div>
    );
  }

  return <>{children}</>;
}
