import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  // Sprawdzamy oba warianty nazw, które dodała integracja
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Placeholder dla etapu budowania
    return createBrowserClient("https://placeholder.supabase.co", "placeholder");
  }

  return createBrowserClient(url, anonKey);
}