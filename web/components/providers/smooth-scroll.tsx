"use client";
import { ReactLenis } from "lenis/react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const emitLenisScroll = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("lenis-scroll"));
  };

  return (
    <ReactLenis 
      root 
      options={{ 
        duration: 1.05,
        lerp: 0.16,
        smoothWheel: true,
        anchors: true
      }}
      onScroll={emitLenisScroll}
    >
      {children}
    </ReactLenis>
  );
}
