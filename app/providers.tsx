"use client";

import { AuthProvider } from "@/lib/auth";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("✅ Providers mounted - React hydration successful");
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
