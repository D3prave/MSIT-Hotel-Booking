import type { LucideIcon } from "lucide-react";
import { Hotel } from "lucide-react";

export const siteConfig: {
  name: string;
  shortName: string;
  description: string;
  logoIcon: LucideIcon;
  nav: { label: string; href: string }[];
  colors: {
    primary: string;
    background: string;
    foreground: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    imageUrl: string;
  };
} = {
  name: "The Resort",
  shortName: "The Resort",
  description: "A fictional hotel booking prototype for coursework.",
  logoIcon: Hotel,
  nav: [
    { label: "Home", href: "/" },
    { label: "Rooms", href: "/#rooms" },
    { label: "Bookings", href: "/bookings" },
  ],
  colors: {
    primary: "#0ea5e9",
    background: "#0b1220",
    foreground: "#e5e7eb",
  },
  hero: {
    headline: "Stay somewhere simple, clean, and comfortable.",
    subheadline:
      "This is a fictional booking site skeleton. Availability checking is mocked for now.",
    imageUrl: "https://placehold.co/1600x900/png?text=The+Resort+%E2%80%94+Placeholder+Image",
  },
};