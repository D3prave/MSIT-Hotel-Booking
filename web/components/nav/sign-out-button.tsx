"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

type SignOutButtonProps = {
  label?: string;
};

export default function SignOutButton({ label = "Sign Out" }: SignOutButtonProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const handleSignOut = async () => {
    // 1. Wylogowanie w Supabase (czyści lokalne ciasteczka)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error signing out:", error.message);
      return;
    }

    // 2. Wymuszenie odświeżenia routera
    router.refresh();
    
    // 3. Twarde przeładowanie strony (window.location), aby Navbar pobrał nowy stan z serwera
    // To gwarantuje, że Server Component Navbar zobaczy brak sesji.
    window.location.href = "/";
  };

  return (
    <button 
      onClick={handleSignOut}
      className="hover:text-red-500 transition-colors font-black uppercase active:scale-95 duration-300"
    >
      {label}
    </button>
  );
}
