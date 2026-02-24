"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

// Kluczowe: wymusza renderowanie dynamiczne i zapobiega błędom next build
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // Refresh synchronizuje sesję z middleware (proxy)
      router.refresh();
      // Używamy window.location dla twardego przeładowania stanu
      setTimeout(() => {
        window.location.href = "/";
      }, 400);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1220] px-4">
      <div className="w-full max-w-md p-10 bg-white/5 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-black italic tracking-tighter text-white uppercase">
            DENKRAUM
          </h1>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="EMAIL" 
            required
            className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white placeholder:text-white/20 focus:border-[#a87f5d] outline-none transition-all duration-300"
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            required
            className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white placeholder:text-white/20 focus:border-[#a87f5d] outline-none transition-all duration-300"
            onChange={e => setPassword(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#3d2b1f] py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white hover:brightness-125 active:scale-95 transition-all duration-300 shadow-2xl"
          >
            {loading ? "AUTHENTICATING..." : isRegistering ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full mt-10 text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] hover:text-[#a87f5d] transition-colors"
        >
          {isRegistering ? "BACK TO SIGN IN" : "NO ACCOUNT? REGISTER"}
        </button>
      </div>
    </div>
  );
}