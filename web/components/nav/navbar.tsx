// web/components/nav/navbar.tsx
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site-config";
import { AuthButton } from "@/components/auth/auth-button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-navy/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <img src={siteConfig.logoUrl} alt="Logo" className="h-10 w-auto" />
          <span className="font-serif text-xl font-bold tracking-tighter text-white">
            {siteConfig.name}
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <div className="hidden space-x-6 md:flex">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}