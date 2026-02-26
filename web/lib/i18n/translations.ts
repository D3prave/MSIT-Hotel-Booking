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
      feedback: "Feedback",
      services: "Services",
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
      servicesTitle: "Services for Bleisure Guests",
      servicesSubtitle:
        "Cross-sell and up-sell offers for productivity, recovery, local culture, and premium hosting.",
      servicesIntro:
        "Designed for guests who blend executive focus with leisure: work blocks, wellness breaks, curated drives, and local culinary moments.",
      servicesCards: [
        {
          details: [
            "1-hour guided stretch and relaxation session.",
            "Infused water drink included.",
            "Optional +30 min automotive-themed cognitive quiz.",
          ],
          positioning:
            "Work-life balance reset between meetings.",
          price: "EUR 29 / person",
          title: "Stretch & Think Workshop",
          upsell:
            "Upsell: Book as a meeting break or before dinner.",
        },
        {
          details: [
            "3-item tasting flight: zero-alcohol or botanical alcohol options.",
            "Local seasonal lounge experience.",
            "Pairs well with Stretch & Think for bundle savings.",
          ],
          positioning:
            "Local infused drink tasting with lounge atmosphere.",
          price: "EUR 18 / person",
          title: "Infused Drink Tasting Flight",
          upsell:
            "Upsell: +EUR 10 with aperitif plate (cheese + nuts).",
        },
        {
          details: [
            "Two conference rooms for focused small gatherings.",
            "Projector, flipchart, and videoconference tools included.",
            "Coffee and water included.",
          ],
          positioning:
            "Professional space for bleisure guests hosting small meetings.",
          price: "Half day (4h): EUR 89 | Full day: EUR 149",
          title: "Conference / Meeting Room Rental",
          upsell: "Upsell: Light snacks for EUR 15 per guest.",
        },
        {
          details: [
            "Private Stretch & Sauna: 60 min sauna + guided stretching.",
            "Deep Recovery Bundle: sauna + infused drinks + stretch session.",
            "Built for regenerative balance after business days.",
          ],
          positioning:
            "Recovery add-ons for reset and balance.",
          price: "Stretch & Sauna: EUR 59 | Deep Recovery: EUR 69",
          title: "Wellness Add-Ons",
          upsell: "Upsell: Combine with evening dinner experience.",
        },
        {
          details: [
            "Classic-car chauffeur routes through Altmuhltal.",
            "Half day and full day options with curated village stops.",
            "Map, snacks, drink, and local guide tips included.",
          ],
          positioning:
            "Scenic drive experience with regional picnic options.",
          price: "Half day: EUR 89 | Full day: EUR 169",
          title: "Scenic Drive & Picnic",
          upsell: "Upsell: Picnic pack for EUR 39 per person.",
        },
        {
          details: [
            "Regional dinner tasting menu, ideally with Altmuhltal lamb.",
            "Great for longer stays, VIP guests, and C-level hosting.",
            "Business-friendly evening format.",
          ],
          positioning:
            "Local culinary upgrade for premium stays.",
          price: "Tasting menu: EUR 59 / person",
          title: "Local Culinary Experience",
          upsell: "Upsell: Wine pairing +EUR 29.",
        },
      ],
      bundlesTitle: "Bleisure Bundles",
      bundlesSubtitle:
        "Pre-built combinations for guests extending business trips with leisure.",
      bundles: [
        {
          contents: "Meeting room (4h), Stretch & Think, infused drinks",
          price: "EUR 109",
          title: "Work & Wellness Package",
        },
        {
          contents: "Scenic drive, picnic pack, dinner tasting menu",
          price: "EUR 119",
          title: "Drive & Dine",
        },
        {
          contents: "Stretch workshop, signature drink, dinner experience",
          price: "EUR 89",
          title: "Full Balance Day",
        },
      ],
      feedbackTitle: "Guest Feedback",
      feedbackSubtitle: "Client notes from guests staying at DENKRAUM 1886.",
      feedbackIntro:
        "We use your private comments to continuously refine work comfort, service flow, and executive stay quality.",
      feedbackClientVoices: "Client Voices",
      feedbackPrev: "Previous testimonial",
      feedbackNext: "Next testimonial",
      feedbackFormTitle: "Leave a Comment",
      feedbackNameLabel: "Your Name",
      feedbackNamePlaceholder: "Enter your name",
      feedbackCommentLabel: "Your Feedback",
      feedbackCommentPlaceholder:
        "Share what worked well or what we should improve for business stays.",
      feedbackFormHint:
        "Your comment is collected internally and is not published on the website.",
      feedbackSubmit: "Send Feedback",
      feedbackSubmitting: "Sending...",
      feedbackTestimonials: [
        {
          author: "Sarah K.",
          quote:
            "The meeting-room setup was reliable and quiet, and the lounge service made our in-between sessions genuinely productive.",
          role: "Operations Director, Mobility Scale-up",
        },
        {
          author: "Thomas M.",
          quote:
            "I could run calls in the morning and still recover in the evening. The flow between work and downtime felt intentional.",
          role: "C-Level Advisor, Automotive Supplier",
        },
        {
          author: "Elena R.",
          quote:
            "Strong Wi-Fi, clear logistics, and a premium atmosphere. Exactly the kind of base I need for short executive trips.",
          role: "Regional Sales Lead, Enterprise SaaS",
        },
      ],
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
    serviceForm: {
      book: "Book Service",
      booking: "Booking...",
      dateLabel: "Date",
      estimatedTotal: "Estimated total",
      participantsLabel: "Guests",
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
      participantsLabel: "Guests",
      roomFallback: "Booked room",
      roomBookingsSection: "Room Bookings",
      roomIdPrefix: "Room ID",
      serviceBookingsSection: "Service Bookings",
      servicesEmpty: "No service bookings yet.",
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
      feedbackInsertBlockedPermissions:
        "Feedback submission was blocked by database permissions. Please allow INSERT on guest_feedback for anon and authenticated users.",
      feedbackSaveError:
        "We could not save your feedback. Please try again.",
      feedbackSaved:
        "Thank you. Your feedback was submitted.",
      feedbackTableMissing:
        "Feedback table is missing. Please run the guest_feedback SQL migration.",
      invalidBookingId: "Invalid booking id.",
      invalidDates: "Please choose valid check-in and check-out dates.",
      invalidFeedbackName:
        "Please enter your name between 2 and 120 characters.",
      invalidFeedbackMessage:
        "Please enter feedback up to 1200 characters.",
      invalidRoomSelection: "Please choose a valid room.",
      invalidServiceBookingId: "Invalid service booking id.",
      invalidServiceDate: "Please choose a valid service date.",
      invalidServiceParticipants: "Please choose a valid number of guests.",
      invalidServiceSelection: "Please choose a valid service.",
      notAllowedDelete: "You are not allowed to remove this booking.",
      notAllowedUpdate: "You are not allowed to update this booking.",
      notAllowedServiceDelete:
        "You are not allowed to remove this service booking.",
      notAllowedServiceUpdate:
        "You are not allowed to update this service booking.",
      roomNotAvailable:
        "This room is not available for the selected dates.",
      saveBookingError:
        "We could not complete your booking. Please try again.",
      serviceBookingAlreadyConfirmed:
        "Service booking is already confirmed.",
      serviceBookingConfirmed:
        "Service booking confirmed successfully.",
      serviceBookingCreated:
        "Service booking created successfully.",
      serviceBookingDeleteBlockedPermissions:
        "Service booking removal was blocked by database permissions. Please allow DELETE on service_bookings for the owner.",
      serviceBookingInsertBlockedPermissions:
        "Service booking creation was blocked by database permissions. Please allow INSERT on service_bookings for authenticated users.",
      serviceBookingNotFound: "Service booking no longer exists.",
      serviceBookingRemoved:
        "Service booking removed successfully.",
      serviceBookingSaveError:
        "We could not complete your service booking. Please try again.",
      serviceBookingUpdateBlockedPermissions:
        "Service booking update was blocked by database permissions. Please allow UPDATE on service_bookings for the owner.",
      serviceBookingsTableMissing:
        "Service bookings table is missing. Please run the service_bookings SQL migration.",
      serviceConfirmWriteError:
        "Could not confirm service booking due to a database write error.",
      serviceDeleteWriteError:
        "Could not remove service booking due to a database write error.",
      findServiceBookingError:
        "Could not find this service booking right now. Please refresh and try again.",
    },
  },
  de: {
    navbar: {
      admin: "Admin",
      aboutUs: "Ueber Uns",
      contact: "Kontakt",
      experience: "Erlebnis",
      feedback: "Feedback",
      services: "Services",
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
      line1: "Work clearly.",
      line2: "Rest deeply.",
      line3: "Drive freely.",
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
      servicesTitle: "Services fuer Bleisure Gaeste",
      servicesSubtitle:
        "Cross-Sell und Up-Sell Leistungen fuer Produktivitaet, Regeneration und regionale Erlebnisse.",
      servicesIntro:
        "Fuer Gaeste, die Business und Freizeit verbinden: fokussierte Arbeitszeit, Wellness-Pausen, kuratierte Fahrten und kulinarische Highlights.",
      servicesCards: [
        {
          details: [
            "1-stuendige gefuehrte Stretch- und Relax-Session.",
            "Infused Water Drink inklusive.",
            "Optional: +30 Min Automotive Cognitive Quiz.",
          ],
          positioning:
            "Work-Life-Balance Pause zwischen Meetings.",
          price: "EUR 29 / Person",
          title: "Stretch & Think Workshop",
          upsell:
            "Upsell: Als Pause zwischen Meetings oder vor dem Dinner buchen.",
        },
        {
          details: [
            "3er Tasting Flight: zero-alcohol oder botanical alcohol.",
            "Saisonales Lounge-Erlebnis mit regionalem Fokus.",
            "Ideal in Kombination mit Stretch & Think fuer Bundle-Ersparnis.",
          ],
          positioning:
            "Infused Drink Tasting als lokales Signature-Erlebnis.",
          price: "EUR 18 / Person",
          title: "Infused Drink Tasting Flight",
          upsell:
            "Upsell: +EUR 10 fuer Aperitif-Plate (Kaese + Nuesse).",
        },
        {
          details: [
            "Zwei Konferenzraeume fuer kleine professionelle Runden.",
            "Projektor, Flipchart und Videokonferenz-Tools inklusive.",
            "Kaffee und Wasser inklusive.",
          ],
          positioning:
            "Meeting-Space fuer Bleisure Professionals.",
          price: "Halber Tag (4h): EUR 89 | Ganzer Tag: EUR 149",
          title: "Conference / Meeting Room Rental",
          upsell: "Upsell: Light Snacks fuer EUR 15 pro Gast.",
        },
        {
          details: [
            "Private Stretch & Sauna: 60 Min Sauna + Guided Stretching.",
            "Deep Recovery Bundle: Sauna + Infused Drinks + Stretch Session.",
            "Perfekt fuer Regeneration nach intensiven Arbeitstagen.",
          ],
          positioning:
            "Recovery und Balance Add-ons.",
          price: "Stretch & Sauna: EUR 59 | Deep Recovery: EUR 69",
          title: "Wellness Add-Ons",
          upsell: "Upsell: Mit Dinner Experience kombinieren.",
        },
        {
          details: [
            "Classic-Car Chauffeur Touren im Altmuehltal.",
            "Halbtag und Ganztag mit kuratierten Stops in historischen Orten.",
            "Karte, Snacks, Drink und Local Guide Tipps inklusive.",
          ],
          positioning:
            "Scenic Drive Experience mit optionalem Picnic.",
          price: "Halber Tag: EUR 89 | Ganzer Tag: EUR 169",
          title: "Scenic Drive & Picnic",
          upsell: "Upsell: Picnic Pack fuer EUR 39 pro Person.",
        },
        {
          details: [
            "Regionales Dinner Tasting Menu, moeglichst mit Altmuehltal Lamm.",
            "Ideal fuer laengere Aufenthalte, VIP- und C-Level-Gaeste.",
            "Business-freundliches Abendformat.",
          ],
          positioning:
            "Kulinarisches Upgrade fuer Premium-Aufenthalte.",
          price: "Tasting Menu: EUR 59 / Person",
          title: "Local Culinary Experience",
          upsell: "Upsell: Wine Pairing +EUR 29.",
        },
      ],
      bundlesTitle: "Bleisure Bundles",
      bundlesSubtitle:
        "Vorkonfigurierte Kombinationen fuer Business-Gaeste mit Leisure-Verlaengerung.",
      bundles: [
        {
          contents: "Meeting room (4h), Stretch & Think, infused drinks",
          price: "EUR 109",
          title: "Work & Wellness Package",
        },
        {
          contents: "Scenic drive, picnic pack, dinner tasting menu",
          price: "EUR 119",
          title: "Drive & Dine",
        },
        {
          contents: "Stretch workshop, signature drink, dinner experience",
          price: "EUR 89",
          title: "Full Balance Day",
        },
      ],
      feedbackTitle: "Gaeste-Feedback",
      feedbackSubtitle: "Rueckmeldungen von unseren Gaesten im DENKRAUM 1886.",
      feedbackIntro:
        "Wir sammeln Ihr Feedback intern, um Arbeitskomfort, Servicequalitaet und den gesamten Aufenthalt laufend zu verbessern.",
      feedbackClientVoices: "Stimmen unserer Gaeste",
      feedbackPrev: "Vorherige Bewertung",
      feedbackNext: "Naechste Bewertung",
      feedbackFormTitle: "Kommentar hinterlassen",
      feedbackNameLabel: "Ihr Name",
      feedbackNamePlaceholder: "Namen eingeben",
      feedbackCommentLabel: "Ihr Feedback",
      feedbackCommentPlaceholder:
        "Teilen Sie mit, was gut war oder was wir fuer Business-Aufenthalte verbessern koennen.",
      feedbackFormHint:
        "Ihr Kommentar wird intern erfasst und nicht auf der Website veroeffentlicht.",
      feedbackSubmit: "Feedback senden",
      feedbackSubmitting: "Sende...",
      feedbackTestimonials: [
        {
          author: "Sarah K.",
          quote:
            "Die Meeting-Raeume waren zuverlaessig und ruhig, und der Lounge-Service hat unsere Pausen wirklich produktiv gemacht.",
          role: "Operations Director, Mobility Scale-up",
        },
        {
          author: "Thomas M.",
          quote:
            "Morgens konnte ich Calls durchziehen und abends trotzdem regenerieren. Die Balance zwischen Fokus und Erholung hat perfekt gepasst.",
          role: "C-Level Advisor, Automotive Supplier",
        },
        {
          author: "Elena R.",
          quote:
            "Stabiles WLAN, klare Organisation und ein hochwertiges Ambiente. Genau die Basis, die ich fuer kurze Executive-Trips brauche.",
          role: "Regional Sales Lead, Enterprise SaaS",
        },
      ],
      pricePerNight: "/ Nacht",
      roomFallbackDescription: "Premium-Arbeitsraum und Bauernhaus-Charme.",
      roomTypeByCategory: {
        attic: "The 1886 Attic Suite",
        deluxe: "Deluxe Business Suite",
        economy: "Economy Workroom",
        superior: "Superior Garden View",
      },
    },
    roomForm: {
      bookRoom: "Zimmer buchen",
      checking: "Pruefe...",
      unavailable: "Nicht verfuegbar",
    },
    serviceForm: {
      book: "Service buchen",
      booking: "Buche...",
      dateLabel: "Datum",
      estimatedTotal: "Geschaetzter Gesamtpreis",
      participantsLabel: "Gaeste",
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
      participantsLabel: "Gaeste",
      roomFallback: "Gebuchtes Zimmer",
      roomBookingsSection: "Zimmerbuchungen",
      roomIdPrefix: "Zimmer-ID",
      serviceBookingsSection: "Service-Buchungen",
      servicesEmpty: "Noch keine Service-Buchungen vorhanden.",
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
      feedbackInsertBlockedPermissions:
        "Das Senden von Feedback wurde durch Datenbankrechte blockiert. Bitte erlauben Sie INSERT auf guest_feedback fuer anon und authenticated.",
      feedbackSaveError:
        "Ihr Feedback konnte nicht gespeichert werden. Bitte erneut versuchen.",
      feedbackSaved:
        "Danke. Ihr Feedback wurde erfolgreich uebermittelt.",
      feedbackTableMissing:
        "Die Tabelle guest_feedback fehlt. Bitte fuehren Sie die SQL-Migration fuer Feedback aus.",
      invalidBookingId: "Ungueltige Buchungs-ID.",
      invalidDates:
        "Bitte waehlen Sie gueltige Check-in- und Check-out-Daten.",
      invalidFeedbackName:
        "Bitte geben Sie einen Namen zwischen 2 und 120 Zeichen ein.",
      invalidFeedbackMessage:
        "Bitte geben Sie Feedback mit maximal 1200 Zeichen ein.",
      invalidRoomSelection: "Bitte waehlen Sie ein gueltiges Zimmer.",
      invalidServiceBookingId: "Ungueltige Service-Buchungs-ID.",
      invalidServiceDate:
        "Bitte waehlen Sie ein gueltiges Service-Datum.",
      invalidServiceParticipants:
        "Bitte waehlen Sie eine gueltige Anzahl an Gaesten.",
      invalidServiceSelection: "Bitte waehlen Sie einen gueltigen Service.",
      notAllowedDelete:
        "Sie sind nicht berechtigt, diese Buchung zu entfernen.",
      notAllowedUpdate:
        "Sie sind nicht berechtigt, diese Buchung zu aktualisieren.",
      notAllowedServiceDelete:
        "Sie sind nicht berechtigt, diese Service-Buchung zu entfernen.",
      notAllowedServiceUpdate:
        "Sie sind nicht berechtigt, diese Service-Buchung zu aktualisieren.",
      roomNotAvailable:
        "Dieses Zimmer ist fuer den gewaehlten Zeitraum nicht verfuegbar.",
      saveBookingError:
        "Die Buchung konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
      serviceBookingAlreadyConfirmed:
        "Service-Buchung ist bereits bestaetigt.",
      serviceBookingConfirmed:
        "Service-Buchung erfolgreich bestaetigt.",
      serviceBookingCreated:
        "Service-Buchung erfolgreich erstellt.",
      serviceBookingDeleteBlockedPermissions:
        "Das Entfernen der Service-Buchung wurde durch Datenbankrechte blockiert. Bitte erlauben Sie DELETE auf service_bookings fuer den Eigentuemer.",
      serviceBookingInsertBlockedPermissions:
        "Die Erstellung der Service-Buchung wurde durch Datenbankrechte blockiert. Bitte erlauben Sie INSERT auf service_bookings fuer authentifizierte Nutzer.",
      serviceBookingNotFound: "Service-Buchung existiert nicht mehr.",
      serviceBookingRemoved:
        "Service-Buchung erfolgreich entfernt.",
      serviceBookingSaveError:
        "Die Service-Buchung konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
      serviceBookingUpdateBlockedPermissions:
        "Die Aktualisierung der Service-Buchung wurde durch Datenbankrechte blockiert. Bitte erlauben Sie UPDATE auf service_bookings fuer den Eigentuemer.",
      serviceBookingsTableMissing:
        "Die Tabelle service_bookings fehlt. Bitte fuehren Sie die SQL-Migration fuer Service-Buchungen aus.",
      serviceConfirmWriteError:
        "Service-Buchung konnte wegen eines Datenbank-Fehlers nicht bestaetigt werden.",
      serviceDeleteWriteError:
        "Service-Buchung konnte wegen eines Datenbank-Fehlers nicht entfernt werden.",
      findServiceBookingError:
        "Diese Service-Buchung konnte gerade nicht gefunden werden. Bitte aktualisieren und erneut versuchen.",
    },
  },
} as const;

export type Dictionary = (typeof translations)[Locale];
