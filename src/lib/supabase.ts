import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a singleton Supabase client for browser usage
// Using lazy initialization to ensure it's only created on the client side
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  // Only create the client on the browser (client-side)
  if (typeof window === "undefined") {
    throw new Error("Supabase client can only be used on the client side");
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // We handle OAuth callback in route handler
      flowType: 'pkce',
    },
  });

  return supabaseInstance;
};

// Export a client that can be safely imported but will error if used on server
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  },
});
