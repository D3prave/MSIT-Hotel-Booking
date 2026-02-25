"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { t } = useLanguage();
  const { addToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data.session) {
        window.location.replace("/");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return;
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        window.location.replace("/");
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      addToast(error.message || t.notifications.loginFailed, "error");
      setLoading(false);
    } else {
      if (isRegistering && !data.session) {
        addToast("Account created. Confirm email, then sign in.", "success");
        setIsRegistering(false);
        setLoading(false);
        return;
      }

      const resolvedSession = data.session ?? (await supabase.auth.getSession()).data.session;
      if (!resolvedSession) {
        addToast(t.notifications.loginFailed, "error");
        setLoading(false);
        return;
      }

      window.location.assign("/");
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
            placeholder={t.login.email}
            required
            className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white outline-none focus:border-[#a87f5d] transition-all"
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder={t.login.password}
            required
            className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl text-white outline-none focus:border-[#a87f5d] transition-all"
            onChange={e => setPassword(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#3d2b1f] py-6 rounded-2xl font-black uppercase tracking-widest text-white hover:brightness-125 active:scale-95 transition-all"
          >
            {loading ? t.login.authenticating : isRegistering ? t.login.createAccount : t.login.signIn}
          </button>
        </form>
        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full mt-10 text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] hover:text-[#a87f5d] transition-colors"
        >
          {isRegistering ? t.login.backToSignIn : t.login.noAccountRegister}
        </button>
      </div>
    </div>
  );
}
