"use client";

import dynamic from "next/dynamic";

// To sprawia, że Next.js całkowicie ignoruje zawartość logowania podczas budowania (SSR: false)
const LoginForm = dynamic(() => import("@/components/auth/login-form"), { 
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1220]">
      <div className="text-white font-serif italic animate-pulse text-2xl">DENKRAUM...</div>
    </div>
  )
});

export default function LoginPage() {
  return <LoginForm />;
}