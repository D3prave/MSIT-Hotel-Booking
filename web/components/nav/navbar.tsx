"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import SignOutButton from "./sign-out-button";
import LanguageToggle from "./language-toggle";
import { useLanguage } from "@/components/providers/language-provider";

type NavbarProps = {
  adminEmailsRaw?: string;
};

function parseAdminEmails(rawValue: string | undefined) {
  if (!rawValue) return [];
  return rawValue
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export default function Navbar({ adminEmailsRaw = "" }: NavbarProps) {
  const { t } = useLanguage();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const adminEmails = useMemo(() => parseAdminEmails(adminEmailsRaw), [adminEmailsRaw]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUserEmail(data.user?.email ?? null);
      setAuthReady(true);
    };

    void syncUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const isLoggedIn = userEmail !== null;
  const isAdmin = userEmail ? adminEmails.includes(userEmail.toLowerCase()) : false;

  return (
    <nav className="fixed top-0 z-50 flex w-full justify-center px-3 py-3 sm:px-4 md:px-6 md:py-7">
      <div className="flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[#0b1220]/60 px-5 py-3 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:px-6 md:rounded-full md:px-9 md:py-4">
        <Link href="/#top" className="group flex items-center gap-2 sm:gap-2.5">
          <Image
            src="/logo.png"
            alt="DENKRAUM"
            width={120}
            height={48}
            quality={85}
            className="h-8 w-auto rounded-[10px] transition-transform duration-700 group-hover:scale-110 sm:h-8 md:h-8"
          />
          <span className="font-serif text-base font-black italic leading-none tracking-tight text-white uppercase sm:text-lg md:text-[20px]">
            DENKRAUM 1886
          </span>
        </Link>

        <div className="hidden items-center gap-4 text-[9px] font-black uppercase tracking-[0.14em] text-white/40 md:flex lg:gap-6 lg:text-[10px]">
          <Link href="/#about" className="transition-colors hover:text-white">{t.navbar.aboutUs}</Link>
          <Link href="/#experience" className="transition-colors hover:text-white">{t.navbar.experience}</Link>
          <Link href="/#rooms" className="transition-colors hover:text-white">{t.navbar.rooms}</Link>
          <Link href="/#services" className="transition-colors hover:text-white">{t.navbar.services}</Link>
          <Link href="/#contact" className="transition-colors hover:text-white">{t.navbar.contact}</Link>

          {authReady ? (
            isLoggedIn ? (
              <>
                {isAdmin ? <Link href="/admin" className="transition-colors hover:text-white">{t.navbar.admin}</Link> : null}
                <Link href="/bookings" className="font-black text-[#0ea5e9]">{t.navbar.myStays}</Link>
                <SignOutButton label={t.navbar.signOut} />
              </>
            ) : (
              <Link href="/login" className="rounded-full bg-white px-6 py-2.5 text-[10px] font-black text-black shadow-lg">
                {t.navbar.login}
              </Link>
            )
          ) : (
            <div className="h-8 w-20 animate-pulse rounded-full bg-white/10" />
          )}

          <LanguageToggle compact />
        </div>

        <details className="relative md:hidden">
          <summary className="list-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
            {t.navbar.menu}
          </summary>
          <div className="absolute right-0 mt-3 w-[min(19rem,calc(100vw-1.5rem))] rounded-2xl border border-white/15 bg-[#0b1220]/95 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex flex-col gap-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
              <Link href="/#about" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">{t.navbar.aboutUs}</Link>
              <Link href="/#experience" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">{t.navbar.experience}</Link>
              <Link href="/#rooms" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">{t.navbar.rooms}</Link>
              <Link href="/#services" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">{t.navbar.services}</Link>
              <Link href="/#contact" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">{t.navbar.contact}</Link>

              {authReady ? (
                isLoggedIn ? (
                  <>
                    {isAdmin ? <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">{t.navbar.admin}</Link> : null}
                    <Link href="/bookings" className="rounded-lg px-3 py-2 text-[#0ea5e9] hover:bg-white/10">{t.navbar.myStays}</Link>
                    <div className="rounded-lg px-3 py-2 text-left hover:bg-white/10 hover:text-red-400">
                      <SignOutButton label={t.navbar.signOut} />
                    </div>
                  </>
                ) : (
                  <Link href="/login" className="mt-1 rounded-lg bg-white px-3 py-2 text-center text-black">
                    {t.navbar.login}
                  </Link>
                )
              ) : (
                <div className="h-9 w-full animate-pulse rounded-lg bg-white/10" />
              )}

              <div className="mt-1">
                <LanguageToggle label={t.navbar.language} />
              </div>
            </div>
          </div>
        </details>
      </div>
    </nav>
  );
}
