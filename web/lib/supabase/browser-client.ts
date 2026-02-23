import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  // Placeholder zapobiega wywaleniu builda na Vercel, gdy zmienne nie są jeszcze wstrzyknięte
  if (!url || !anonKey) {
    return createBrowserClient("https://placeholder.supabase.co", "placeholder");
  }

  return createBrowserClient(url, anonKey);
}