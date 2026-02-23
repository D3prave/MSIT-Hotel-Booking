// web/app/login/page.tsx
"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const handleAuth = async (type: "LOGIN" | "SIGNUP") => {
    setLoading(true);
    const { error } = type === "LOGIN" 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-white">DENKRAUM 1886</h1>
          <p className="mt-2 text-sm text-white/50">Access your professional retreat</p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Corporate Email"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-white/20 focus:border-[#3d2b1f] focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-white/20 focus:border-[#3d2b1f] focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => handleAuth("LOGIN")}
              disabled={loading}
              className="rounded-xl bg-[#3d2b1f] py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Sign In
            </button>
            <button
              onClick={() => handleAuth("SIGNUP")}
              disabled={loading}
              className="rounded-xl border border-white/10 py-4 font-bold text-white transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}