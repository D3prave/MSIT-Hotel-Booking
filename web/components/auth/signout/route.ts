// web/app/auth/signout/route.ts
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// Metoda MUSI być POST, ponieważ tak wysyła ją formularz w Navbarze
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  
  // Wylogowanie użytkownika po stronie Supabase
  await supabase.auth.signOut();

  const origin = new URL(request.url).origin;
  
  // Odświeżenie cache'u strony głównej i layoutu
  revalidatePath("/", "layout");
  
  // Przekierowanie na stronę główną
  return NextResponse.redirect(origin, {
    status: 302,
  });
}