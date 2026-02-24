"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Bezpieczne inicjowanie klienta tylko w przeglądarce
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
      window.location.replace("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1220] px-4">
      <div className="w-full max-w-md p-10 bg-white/5 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-black italic tracking-tighter text-white uppercase">DENKRAUM</h1>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="EMAIL" 
            required
            className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white outline-none focus:border-[#a87f5d] transition-all"
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            required
            className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white outline-none focus:border-[#a87f5d] transition-all"
            onChange={e => setPassword(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#3d2b1f] py-6 rounded-2xl font-black uppercase tracking-widest text-white hover:brightness-125 active:scale-95 transition-all"
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