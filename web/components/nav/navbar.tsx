import Link from "next/link";
import { siteConfig } from "@/config/site-config";
import { AuthButton } from "@/components/auth/auth-button";

export function Navbar() {
  const Logo = siteConfig.logoIcon;

  return (
    <header className="sticky top-0 z-50 pointer-events-auto border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-5 w-5" />
          <span className="font-semibold">{siteConfig.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/80 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <AuthButton />
      </div>
    </header>
  );
}