import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import SignOutButton from "./sign-out-button";

export default async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="fixed top-0 z-50 flex w-full justify-center px-3 py-3 sm:px-4 md:px-6 md:py-6">
      <div className="flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[#0b1220]/60 px-4 py-2.5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:px-5 md:rounded-full md:px-8 md:py-3">
        <Link href="/#top" className="group flex items-center gap-2 sm:gap-2.5">
          <img
            src="/logo.png"
            alt="DENKRAUM"
            className="h-7 w-auto rounded-sm bg-[#f6efe2] p-1 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-transform duration-700 group-hover:scale-110 sm:h-8 md:h-7"
          />
          <span className="font-serif text-sm font-black italic leading-none tracking-tight text-white uppercase sm:text-base md:text-[19px]">
            DENKRAUM 1886
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 md:flex">
          <Link href="/#about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/#experience" className="hover:text-white transition-colors">Experience</Link>
          <Link href="/#rooms" className="hover:text-white transition-colors">Rooms</Link>
          <Link href="/#contact" className="hover:text-white transition-colors">Contact</Link>
          
          {user ? (
            <>
              <Link href="/bookings" className="text-[#0ea5e9] font-black">My Stays</Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-white px-5 py-2 text-[9px] text-black font-black shadow-lg">
              Login
            </Link>
          )}
        </div>

        <details className="relative md:hidden">
          <summary className="list-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/15 bg-[#0b1220]/95 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex flex-col gap-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
              <Link href="/#about" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">About Us</Link>
              <Link href="/#experience" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">Experience</Link>
              <Link href="/#rooms" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">Rooms</Link>
              <Link href="/#contact" className="rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white">Contact</Link>

              {user ? (
                <>
                  <Link href="/bookings" className="rounded-lg px-3 py-2 text-[#0ea5e9] hover:bg-white/10">My Stays</Link>
                  <div className="rounded-lg px-3 py-2 text-left hover:bg-white/10 hover:text-red-400">
                    <SignOutButton />
                  </div>
                </>
              ) : (
                <Link href="/login" className="mt-1 rounded-lg bg-white px-3 py-2 text-center text-black">
                  Login
                </Link>
              )}
            </div>
          </div>
        </details>
      </div>
    </nav>
  );
}
