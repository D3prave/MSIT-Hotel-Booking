import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import SignOutButton from "./sign-out-button";

export default async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-center px-6 py-6">
      <div className="flex w-full max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#0b1220]/60 px-8 py-3 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="DENKRAUM" className="h-6 w-auto transition-transform duration-700 group-hover:scale-110" />
          <span className="font-serif text-base font-black italic tracking-tighter text-white uppercase">
            DENKRAUM 1886
          </span>
        </Link>
        
        <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
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
      </div>
    </nav>
  );
}