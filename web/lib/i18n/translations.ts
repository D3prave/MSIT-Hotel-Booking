export const SUPPORTED_LOCALES = ["en", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type RoomCategory = "attic" | "deluxe" | "economy" | "superior";
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "locale";
const ROOM_CATEGORIES = ["attic", "deluxe", "economy", "superior"] as const;

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "de";
}

export function getRoomCategory(roomType: string): RoomCategory | null {
  const value = roomType.toLowerCase();
  if (value.includes("economy")) return "economy";
  if (value.includes("superior")) return "superior";
  if (value.includes("deluxe")) return "deluxe";
  if (value.includes("attic")) return "attic";
  return null;
}

export function isRoomCategory(value: string): value is RoomCategory {
  return (ROOM_CATEGORIES as readonly string[]).includes(value);
}

export const translations = {
  en: {
    navbar: {
      admin: "Admin",
      aboutUs: "About Us",
      contact: "Contact",
      experience: "Experience",
      language: "Language",
      login: "Login",
      menu: "Menu",
      myStays: "My Stays",
      rooms: "Rooms",
      signOut: "Sign Out",
    },
    footer: {
      country: "GERMANY",
      disclosure:
        "This website is a part of a simulation for educational purposes. All bookings, services, and corporate retreat offerings are not real. Built as a professional prototype for the Kipfenberg estate development.",
      estate: "KIPFENBERG ESTATE",
    },
    hero: {
      line1: "Work clearly.",
      line2: "Rest deeply.",
      line3: "Drive freely.",
      subheadline:
        "Your professional agenda transforms into meaningful personal time in our historic farmhouse.",
    },
    about: {
      titlePrefix: "A Legacy of",
      titleHighlight: "Innovation",
      paragraphs: [
        "The year 1886 was a pivot point for humanity. While the original stone walls of our farmhouse were being raised in the Bavarian countryside, Carl Benz was patenting the Motorwagen. These two worlds, steadfast tradition and radical movement, are the DNA of DENKRAUM.",
        "Originally built as a regional hub for agriculture and community gathering, the estate has survived over a century of change. In 2026, it was meticulously restored to serve the modern pioneer.",
        "Today, DENKRAUM 1886 stands as a bridge between Ingolstadt's automotive future and Bavaria's cultural heritage.",
      ],
      pillars: [
        {
          description:
            "Focused workspaces designed for deep work and executive clarity.",
          title: "Productivity",
        },
        {
          description:
            "Boutique wellness and Finnish sauna traditions for total recovery.",
          title: "Regeneration",
        },
        {
          description:
            "Scenic driving routes and classic-car culture at the gateway to nature.",
          title: "Experience",
        },
      ],
    },
    home: {
      checkIn: "Check In",
      checkOut: "Check Out",
      executiveTitle: "Executive Retreats",
      executiveSubtitle: "25 designer rooms in our historic 1886 farmhouse.",
      roomDescriptionByCategory: {
        attic:
          "Our flagship luxury suite in the historic attic. Maximum privacy and classic atmosphere.",
        deluxe:
          "Premium executive suite with high-end conferencing tech and extra comfort.",
        economy:
          "Focused workspace in our historic farmhouse. Perfect for deep focus sessions.",
        superior:
          "Panoramic views of the Altmuhltal nature with a premium ergonomic setup.",
      },
      experienceCards: [
        {
          description: "Historic views overlooking the Altmuhltal.",
          title: "Kipfenberg Castle",
        },
        {
          description: "Panoramic routes for classic car enthusiasts.",
          title: "Altmuhltal Drive",
        },
        {
          description: "Professional infrastructure for focus.",
          title: "Executive Focus",
        },
        {
          description: "Finnish sauna and whirlpool relaxation.",
          title: "Deep Recovery",
        },
        {
          description: "Regional flavors to power your day.",
          title: "Bavarian Breakfast",
        },
        {
          description: "Billiards and local drinks in our chill area.",
          title: "Leisure & Spirits",
        },
      ],
      experienceTitle: "The DENKRAUM Experience",
      pricePerNight: "/ night",
      roomFallbackDescription: "Premium workspace and farmhouse charm.",
      roomTypeByCategory: {
        attic: "The 1886 Attic Suite",
        deluxe: "Deluxe Business Suite",
        economy: "Economy Workroom",
        superior: "Superior Garden View",
      },
    },
    roomForm: {
      bookRoom: "Book Room",
      checking: "Checking...",
      unavailable: "Unavailable",
    },
    notifications: {
      bookingConfirmed: "Booking confirmed.",
      bookingCreated: "Booking created.",
      bookingRemoved: "Booking removed.",
      loginFailed: "Authentication failed. Please try again.",
    },
    bookings: {
      empty: "No bookings found yet.",
      nightPlural: "nights",
      nightSingular: "night",
      roomFallback: "Booked room",
      roomIdPrefix: "Room ID",
      status: {
        cancelled: "cancelled",
        confirmed: "confirmed",
        pending: "pending",
      },
      subtitle: "Confirm your pending requests or manage active stays.",
      title: "Your DENKRAUM Stays",
      totalPending: "Total pending",
      totalValue: "Total Value",
    },
    bookingActions: {
      cancel: "Cancel",
      cancelling: "Cancelling...",
      confirm: "Confirm",
      confirming: "Confirming...",
      remove: "Remove",
      removing: "Removing...",
    },
    login: {
      authenticating: "AUTHENTICATING...",
      backToSignIn: "BACK TO SIGN IN",
      createAccount: "CREATE ACCOUNT",
      email: "EMAIL",
      loading: "DENKRAUM...",
      noAccountRegister: "NO ACCOUNT? REGISTER",
      password: "PASSWORD",
      signIn: "SIGN IN",
    },
    contact: {
      email: "stay@denkraum1886.com",
      journal: "Journal",
      location: "Location",
      locationLine1: "Kipfenberg Estate",
      locationLine2: "Altmuhltal, Germany",
      stay: "Stay",
      titleHighlight: "Touch",
      titlePrefix: "Get in",
    },
    admin: {
      analyticsTitle: "Performance Snapshot",
      avgWeekOccupancy: "Avg Occupancy (7d)",
      calendarLegend: "Occupied / total active rooms",
      calendarTitle: "Category Calendar (7 Days)",
      category: "Category",
      dayPrefix: "Day",
      next7Revenue: "Projected Revenue (7d)",
      occupancyToday: "Occupancy Today",
      subtitle:
        "Track weekly occupancy, revenue trends, and room-category availability in one place.",
      title: "Admin Dashboard",
      totalActiveRooms: "Active Rooms",
    },
    actions: {
      bookingAlreadyConfirmed: "Booking is already confirmed.",
      bookingConfirmed: "Booking confirmed successfully.",
      bookingCreated: "Booking created successfully.",
      bookingNotFound: "Booking no longer exists.",
      bookingRemovalBlockedPermissions:
        "Booking removal was blocked by database permissions. Please allow DELETE on bookings for the owner.",
      bookingRemoved: "Booking removed successfully.",
      bookingUpdateBlockedPermissions:
        "Booking update was blocked by database permissions. Please allow UPDATE on bookings for the owner.",
      confirmWriteError:
        "Could not confirm booking due to a database write error.",
      confirmVerifyError:
        "Booking update could not be verified. Please refresh and check status.",
      deleteVerifyError:
        "Booking removal could not be verified. Please refresh and check again.",
      deleteWriteError:
        "Could not remove booking due to a database write error.",
      findBookingError:
        "Could not find this booking right now. Please refresh and try again.",
      invalidBookingId: "Invalid booking id.",
      invalidDates: "Please choose valid check-in and check-out dates.",
      invalidRoomSelection: "Please choose a valid room.",
      notAllowedDelete: "You are not allowed to remove this booking.",
      notAllowedUpdate: "You are not allowed to update this booking.",
      roomNotAvailable:
        "This room is not available for the selected dates.",
      saveBookingError:
        "We could not complete your booking. Please try again.",
    },
  },
  de: {
    navbar: {
      admin: "Admin",
      aboutUs: "Ueber Uns",
      contact: "Kontakt",
      experience: "Erlebnis",
      language: "Sprache",
      login: "Anmelden",
      menu: "Menue",
      myStays: "Buchungen",
      rooms: "Zimmer",
      signOut: "Abmelden",
    },
    footer: {
      country: "DEUTSCHLAND",
      disclosure:
        "Diese Website ist Teil einer Simulation fuer Bildungszwecke. Alle Buchungen, Services und Retreat-Angebote sind nicht real. Erstellt als professioneller Prototyp fuer die Entwicklung des Kipfenberg-Anwesens.",
      estate: "KIPFENBERG ANWESEN",
    },
    hero: {
      line1: "Klar arbeiten.",
      line2: "Tief erholen.",
      line3: "Frei fahren.",
      subheadline:
        "Ihre professionelle Agenda wird in unserem historischen Bauernhaus zu wertvoller persoenlicher Zeit.",
    },
    about: {
      titlePrefix: "Ein Erbe der",
      titleHighlight: "Innovation",
      paragraphs: [
        "Das Jahr 1886 war ein Wendepunkt der Menschheit. Waehrend die Steinwaende unseres Bauernhauses in Bayern errichtet wurden, patentierte Carl Benz den Motorwagen. Diese beiden Welten, Tradition und Bewegung, sind die DNA von DENKRAUM.",
        "Urspruenglich als regionaler Treffpunkt fuer Landwirtschaft und Gemeinschaft gebaut, hat das Anwesen mehr als ein Jahrhundert Wandel ueberstanden. Im Jahr 2026 wurde es sorgfaeltig restauriert, um dem modernen Pionier zu dienen.",
        "Heute ist DENKRAUM 1886 eine Bruecke zwischen Ingolstadts automobiler Zukunft und bayerischem Kulturerbe.",
      ],
      pillars: [
        {
          description:
            "Fokussierte Arbeitsbereiche fuer Deep Work und klare Entscheidungen.",
          title: "Produktivitaet",
        },
        {
          description:
            "Boutique-Wellness und finnische Sauna-Tradition fuer echte Regeneration.",
          title: "Regeneration",
        },
        {
          description:
            "Panorama-Routen und Klassiker-Kultur am Tor zur Natur.",
          title: "Erlebnis",
        },
      ],
    },
    home: {
      checkIn: "Check-in",
      checkOut: "Check-out",
      executiveTitle: "Business-Retreats",
      executiveSubtitle:
        "25 Designer-Zimmer in unserem historischen Bauernhaus von 1886.",
      roomDescriptionByCategory: {
        attic:
          "Unsere Flagship-Luxussuite im historischen Dachgeschoss. Maximale Privatsphaere und klassisches Ambiente.",
        deluxe:
          "Premium Executive Suite mit hochwertiger Konferenztechnik und extra Komfort.",
        economy:
          "Fokussierter Arbeitsraum in unserem historischen Bauernhaus. Perfekt fuer Deep-Work-Sessions.",
        superior:
          "Panoramablick ins Altmuehltal mit hochwertigem ergonomischem Setup.",
      },
      experienceCards: [
        {
          description: "Historische Ausblicke ueber das Altmuehltal.",
          title: "Burg Kipfenberg",
        },
        {
          description: "Panorama-Routen fuer Liebhaber klassischer Fahrzeuge.",
          title: "Altmuehltal Route",
        },
        {
          description: "Professionelle Infrastruktur fuer konzentriertes Arbeiten.",
          title: "Executive Focus",
        },
        {
          description: "Finnische Sauna und Whirlpool zur Regeneration.",
          title: "Tiefe Erholung",
        },
        {
          description: "Regionale Kueche fuer einen starken Start in den Tag.",
          title: "Bayerisches Fruehstueck",
        },
        {
          description:
            "Billard und lokale Getraenke in unserem entspannten Lounge-Bereich.",
          title: "Leisure & Spirits",
        },
      ],
      experienceTitle: "Das DENKRAUM Erlebnis",
      pricePerNight: "/ Nacht",
      roomFallbackDescription: "Premium-Arbeitsraum und Bauernhaus-Charme.",
      roomTypeByCategory: {
        attic: "1886 Dachgeschoss Suite",
        deluxe: "Deluxe Business Suite",
        economy: "Economy Arbeitszimmer",
        superior: "Superior Gartenblick",
      },
    },
    roomForm: {
      bookRoom: "Zimmer buchen",
      checking: "Pruefe...",
      unavailable: "Nicht verfuegbar",
    },
    notifications: {
      bookingConfirmed: "Buchung bestaetigt.",
      bookingCreated: "Buchung erstellt.",
      bookingRemoved: "Buchung entfernt.",
      loginFailed: "Authentifizierung fehlgeschlagen. Bitte erneut versuchen.",
    },
    bookings: {
      empty: "Noch keine Buchungen gefunden.",
      nightPlural: "Naechte",
      nightSingular: "Nacht",
      roomFallback: "Gebuchtes Zimmer",
      roomIdPrefix: "Zimmer-ID",
      status: {
        cancelled: "storniert",
        confirmed: "bestaetigt",
        pending: "ausstehend",
      },
      subtitle:
        "Bestaetigen Sie ausstehende Anfragen oder verwalten Sie aktive Aufenthalte.",
      title: "Ihre DENKRAUM Aufenthalte",
      totalPending: "Gesamtbetrag offen",
      totalValue: "Gesamtwert",
    },
    bookingActions: {
      cancel: "Stornieren",
      cancelling: "Storniere...",
      confirm: "Bestaetigen",
      confirming: "Bestaetige...",
      remove: "Entfernen",
      removing: "Entferne...",
    },
    login: {
      authenticating: "AUTHENTIFIZIERE...",
      backToSignIn: "ZURUECK ZUM LOGIN",
      createAccount: "KONTO ERSTELLEN",
      email: "E-MAIL",
      loading: "DENKRAUM...",
      noAccountRegister: "KEIN KONTO? REGISTRIEREN",
      password: "PASSWORT",
      signIn: "ANMELDEN",
    },
    contact: {
      email: "stay@denkraum1886.com",
      journal: "Journal",
      location: "Standort",
      locationLine1: "Anwesen Kipfenberg",
      locationLine2: "Altmuehltal, Deutschland",
      stay: "Aufenthalt",
      titleHighlight: "Kontakt",
      titlePrefix: "Nehmen Sie",
    },
    admin: {
      analyticsTitle: "Performance Ueberblick",
      avgWeekOccupancy: "Ø Auslastung (7T)",
      calendarLegend: "Belegt / aktive Zimmer gesamt",
      calendarTitle: "Kategorie-Kalender (7 Tage)",
      category: "Kategorie",
      dayPrefix: "Tag",
      next7Revenue: "Prognose Umsatz (7T)",
      occupancyToday: "Auslastung Heute",
      subtitle:
        "Beobachten Sie woechentliche Auslastung, Umsatztrends und Verfuegbarkeit je Zimmerkategorie.",
      title: "Admin Dashboard",
      totalActiveRooms: "Aktive Zimmer",
    },
    actions: {
      bookingAlreadyConfirmed: "Buchung ist bereits bestaetigt.",
      bookingConfirmed: "Buchung erfolgreich bestaetigt.",
      bookingCreated: "Buchung erfolgreich erstellt.",
      bookingNotFound: "Buchung existiert nicht mehr.",
      bookingRemovalBlockedPermissions:
        "Das Entfernen wurde durch Datenbankrechte blockiert. Bitte erlauben Sie DELETE auf bookings fuer den Eigentuemer.",
      bookingRemoved: "Buchung erfolgreich entfernt.",
      bookingUpdateBlockedPermissions:
        "Die Aktualisierung wurde durch Datenbankrechte blockiert. Bitte erlauben Sie UPDATE auf bookings fuer den Eigentuemer.",
      confirmWriteError:
        "Buchung konnte wegen eines Datenbank-Fehlers nicht bestaetigt werden.",
      confirmVerifyError:
        "Die Bestaetigung konnte nicht verifiziert werden. Bitte aktualisieren und erneut pruefen.",
      deleteVerifyError:
        "Das Entfernen konnte nicht verifiziert werden. Bitte aktualisieren und erneut pruefen.",
      deleteWriteError:
        "Buchung konnte wegen eines Datenbank-Fehlers nicht entfernt werden.",
      findBookingError:
        "Diese Buchung konnte gerade nicht gefunden werden. Bitte aktualisieren und erneut versuchen.",
      invalidBookingId: "Ungueltige Buchungs-ID.",
      invalidDates:
        "Bitte waehlen Sie gueltige Check-in- und Check-out-Daten.",
      invalidRoomSelection: "Bitte waehlen Sie ein gueltiges Zimmer.",
      notAllowedDelete:
        "Sie sind nicht berechtigt, diese Buchung zu entfernen.",
      notAllowedUpdate:
        "Sie sind nicht berechtigt, diese Buchung zu aktualisieren.",
      roomNotAvailable:
        "Dieses Zimmer ist fuer den gewaehlten Zeitraum nicht verfuegbar.",
      saveBookingError:
        "Die Buchung konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
    },
  },
} as const;

export type Dictionary = (typeof translations)[Locale];
