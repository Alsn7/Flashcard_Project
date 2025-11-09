import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a singleton Supabase client for browser usage with proper cookie storage
// This ensures PKCE code verifiers are stored in cookies for OAuth flows
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
  // Only create the client on the browser (client-side)
  if (typeof window === "undefined") {
    throw new Error("Supabase client can only be used on the client side");
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);

  return supabaseInstance;
};

// Export a client that can be safely imported but will error if used on server
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  },
});
