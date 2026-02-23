// web/config/site-config.ts
export const siteConfig = {
  name: "DENKRAUM 1886",
  shortName: "DENKRAUM",
  description: "Work clearly. Rest deeply. Drive freely. A luxurious business retreat in Altmühltal.",
  logoUrl: "/logo.png",
  nav: [
    { label: "Home", href: "/" },
    { label: "Rooms", href: "/#rooms" },
    { label: "Experience", href: "/#experience" },
    { label: "Bookings", href: "/bookings" },
  ],
  colors: {
    primary: "#0ea5e9", 
    background: "#0b1220", 
    timber: "#3d2b1f", 
    forest: "#163020",
  },
  hero: {
    headline: "Work clearly. Rest deeply. Drive freely.",
    subheadline: "Your professional agenda transforms into meaningful personal time in our historic farmhouse.",
    imageUrl: "/hero.jpeg", 
  },
};