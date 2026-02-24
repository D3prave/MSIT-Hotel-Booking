import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  // Jeśli brak kluczy (np. podczas buildu), zwracamy atrapy, aby biblioteka nie rzuciła błędu
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return createBrowserClient(url, anonKey);
}