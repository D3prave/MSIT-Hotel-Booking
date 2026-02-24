// web/app/login/page.tsx
"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      router.refresh();
      router.push("/");
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1220] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="mb-8 text-center font-serif text-3xl font-bold text-white">DENKRAUM 1886</h1>
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full rounded-xl bg-[#3d2b1f] py-4 font-bold text-white hover:opacity-90">
            Sign In
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-white/10"></div>
          <span className="text-xs text-white/30">OR</span>
          <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleSocialLogin('google')} className="rounded-xl border border-white/10 py-3 text-white hover:bg-white/5">
            Google
          </button>
          <button onClick={() => handleSocialLogin('github')} className="rounded-xl border border-white/10 py-3 text-white hover:bg-white/5">
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}