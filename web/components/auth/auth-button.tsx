"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type SessionState = "loading" | "signed_out" | "signed_in";

export function AuthButton() {
  const supabase = createSupabaseBrowserClient();

  const [state, setState] = useState<SessionState>("loading");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState(data.session ? "signed_in" : "signed_out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "signed_in" : "signed_out");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function sendMagicLink() {
    setMsg(null);

    if (!email.includes("@")) {
      setMsg("Enter a valid email.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/`
            : undefined,
      },
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Magic link sent. Check Mailpit (local) or your inbox (prod).");
  }

  async function logout() {
    setMsg(null);
    await supabase.auth.signOut();
  }

  if (state === "loading") {
    return (
      <button className="rounded-xl border border-white/10 px-4 py-2 text-sm opacity-70">
        Loading…
      </button>
    );
  }

  if (state === "signed_in") {
    return (
      <button
        onClick={logout}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
      >
        Logout
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com"
        className="hidden w-56 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none md:block"
      />
      <button
        onClick={sendMagicLink}
        className="rounded-xl bg-white px-4 py-2 text-sm text-black hover:opacity-90"
      >
        Login
      </button>
      {msg && <span className="hidden text-xs text-white/70 md:block">{msg}</span>}
    </div>
  );
}