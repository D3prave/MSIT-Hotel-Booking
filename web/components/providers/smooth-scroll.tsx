"use client";
import { ReactLenis } from "lenis/react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        duration: 1.5, // Faster scroll (1.5 was too slow)
        lerp: 0.1,    // More responsive feel
        smoothWheel: true,
        anchors: true  // This fixes the Navbar links by taking control of # hashes
      }}
    >
      {children}
    </ReactLenis>
  );
}