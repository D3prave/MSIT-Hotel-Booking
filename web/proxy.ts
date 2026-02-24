import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 wymaga eksportu funkcji o nazwie 'proxy'.
 * Ta funkcja przechwytuje każde żądanie, aby zarządzać ciasteczkami sesji.
 */
export async function proxy(request: NextRequest) {
  // Tworzymy bazową odpowiedź, którą będziemy modyfikować
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Pobieramy klucze z Twojego projektu jefeyxfgzkktryxqjfbm
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      // Pobieranie wszystkich ciasteczek z żądania
      getAll() {
        return request.cookies.getAll();
      },
      /**
       * To jest kluczowy mechanizm: kiedy Supabase zmienia token (np. przy wylogowaniu),
       * musimy zaktualizować ciasteczka zarówno w żądaniu, jak i w odpowiedzi.
       */
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        
        // Generujemy nową odpowiedź z zaktualizowanymi nagłówkami
        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  /**
   * Wywołanie getUser() jest niezbędne, aby middleware sprawdził ważność tokena.
   * Jeśli użytkownik został wylogowany, to wywołanie wyczyści ciasteczka sesyjne.
   */
  await supabase.auth.getUser();

  return response;
}

/**
 * Konfiguracja matchera: proxy ma obsługiwać wszystkie ścieżki poza plikami statycznymi.
 */
export const config = {
  matcher: [
    /*
     * Dopasuj wszystkie ścieżki prócz tych zaczynających się od:
     * - _next/static (pliki statyczne)
     * - _next/image (obrazy Next.js)
     * - favicon.ico
     * - obrazy (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};