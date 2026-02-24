import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  // Pobieramy zmienne, ale nie rzucamy błędem natychmiast, jeśli ich brak w Build Time
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return createBrowserClient(url, anonKey);
}