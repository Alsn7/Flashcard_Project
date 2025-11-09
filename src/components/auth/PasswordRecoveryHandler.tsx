"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Handles password recovery flow from email links.
 * Supabase sends recovery tokens in URL hash fragments (not query params),
 * so we need to handle this client-side.
 */
export function PasswordRecoveryHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Only run once
    if (hasProcessed) return;
    
    // Check if there's a hash in the URL (password recovery uses hash fragments)
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash) return;

    // Parse the hash fragment to check for recovery type
    const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
    const type = params.get('type');
    const accessToken = params.get('access_token');

    console.log('🔐 [Recovery Handler] Hash params:', {
      type,
      hasAccessToken: !!accessToken,
      pathname,
      hash: hash.substring(0, 50) + '...' // Log first 50 chars only
    });

    // If this is a password recovery flow, redirect to update password view
    if (type === 'recovery' && accessToken) {
      console.log('🔐 [Recovery Handler] Password recovery detected, redirecting to update password');
      setHasProcessed(true);
      
      // Clear the hash and redirect to update password view
      // Use window.location to fully reload and clear the hash
      window.history.replaceState(null, '', '/?view=update-password');
      router.replace('/?view=update-password');
    }
  }, [router, pathname, hasProcessed]);

  return null; // This component doesn't render anything
}
