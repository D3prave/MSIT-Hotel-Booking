import type { Locale } from "@/lib/i18n/translations";
import nodemailer from "nodemailer";

type BookingEmailEvent = "cancelled" | "confirmed" | "created";
type ServiceBookingEmailEvent = "cancelled" | "confirmed" | "created";

type SendBookingEmailInput = {
  endDate: string;
  event: BookingEmailEvent;
  locale: Locale;
  roomId: string;
  startDate: string;
  toEmail: string | null | undefined;
};

type SendServiceBookingEmailInput = {
  event: ServiceBookingEmailEvent;
  locale: Locale;
  participants: number;
  serviceDate: string;
  serviceTimeSlot?: string | null;
  serviceTitle: string;
  toEmail: string | null | undefined;
  totalPriceCents: number;
};

function isDevEnvironment() {
  return process.env.NODE_ENV !== "production";
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
}

function normalizeServiceTimeSlot(value: string | null | undefined) {
  if (!value) return "-";
  const match = value.match(/\d{2}:\d{2}/);
  return match ? match[0] : value.trim();
}

function getEventLabels(locale: Locale, event: BookingEmailEvent) {
  if (locale === "de") {
    if (event === "created") return { headline: "Buchung erstellt", subject: "DENKRAUM: Buchung erstellt" };
    if (event === "confirmed") return { headline: "Buchung bestaetigt", subject: "DENKRAUM: Buchung bestaetigt" };
    return { headline: "Buchung storniert", subject: "DENKRAUM: Buchung storniert" };
  }

  if (event === "created") return { headline: "Booking created", subject: "DENKRAUM: Booking created" };
  if (event === "confirmed") return { headline: "Booking confirmed", subject: "DENKRAUM: Booking confirmed" };
  return { headline: "Booking cancelled", subject: "DENKRAUM: Booking cancelled" };
}

function getServiceEventLabels(locale: Locale, event: ServiceBookingEmailEvent) {
  if (locale === "de") {
    if (event === "created") return { headline: "Service-Buchung erstellt", subject: "DENKRAUM: Service-Buchung erstellt" };
    if (event === "confirmed") return { headline: "Service-Buchung bestaetigt", subject: "DENKRAUM: Service-Buchung bestaetigt" };
    return { headline: "Service-Buchung storniert", subject: "DENKRAUM: Service-Buchung storniert" };
  }

  if (event === "created") return { headline: "Service booking created", subject: "DENKRAUM: Service booking created" };
  if (event === "confirmed") return { headline: "Service booking confirmed", subject: "DENKRAUM: Service booking confirmed" };
  return { headline: "Service booking cancelled", subject: "DENKRAUM: Service booking cancelled" };
}

export async function sendBookingEmail(input: SendBookingEmailInput) {
  const emailTestTo = process.env.EMAIL_TEST_TO?.trim();
  const resendTestTo = process.env.RESEND_TEST_TO?.trim();
  const to = (emailTestTo || resendTestTo || input.toEmail)?.trim();
  if (!to) {
    if (isDevEnvironment()) console.warn("[email] skipped: recipient is missing");
    return;
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  // Google app passwords are often copied in 4x4 groups with spaces.
  // Remove whitespace so AUTH works even if pasted as "abcd efgh ijkl mnop".
  const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "").trim();
  const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT?.trim() || 465);
  const smtpSecure = parseBoolean(process.env.SMTP_SECURE, true);
  const smtpFrom = process.env.EMAIL_FROM?.trim() || smtpUser || "";

  const { headline, subject } = getEventLabels(input.locale, input.event);

  const text =
    `${headline}\n` +
    `Room ID: ${input.roomId}\n` +
    `Check-in: ${input.startDate}\n` +
    `Check-out: ${input.endDate}\n`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0b1220">
      <h2 style="margin:0 0 12px">${headline}</h2>
      <p style="margin:0 0 6px"><strong>Room ID:</strong> ${input.roomId}</p>
      <p style="margin:0 0 6px"><strong>Check-in:</strong> ${input.startDate}</p>
      <p style="margin:0 0 6px"><strong>Check-out:</strong> ${input.endDate}</p>
    </div>
  `;

  if (smtpUser && smtpPass && smtpFrom) {
    try {
      const transporter = nodemailer.createTransport({
        auth: {
          pass: smtpPass,
          user: smtpUser,
        },
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
      });

      await transporter.sendMail({
        from: smtpFrom,
        html,
        subject,
        text,
        to,
      });
      return;
    } catch (error) {
      if (isDevEnvironment()) {
        console.error("[email] smtp send failed", error);
      }
      // SMTP is intentionally primary for no-domain production use.
      // Do not fall back to Resend here; with no domain that fails with 403 anyway.
      return;
    }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  if (!apiKey || !from) {
    if (isDevEnvironment()) {
      console.warn("[email] skipped: no SMTP config and missing RESEND_API_KEY/RESEND_FROM_EMAIL");
    }
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from,
        html,
        subject,
        text,
        to: [to],
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok && isDevEnvironment()) {
      const details = await response.text().catch(() => "");
      console.error(`[email] resend rejected request (${response.status})`, details);
      if (from.toLowerCase() === "onboarding@resend.dev") {
        console.error(
          "[email] no-domain mode: set RESEND_TEST_TO to your verified Resend account email."
        );
      }
    }
  } catch {
    if (isDevEnvironment()) {
      console.error("[email] failed to call Resend API");
    }
    // Best-effort notification; do not block booking flow.
  }
}

export async function sendServiceBookingEmail(input: SendServiceBookingEmailInput) {
  const emailTestTo = process.env.EMAIL_TEST_TO?.trim();
  const resendTestTo = process.env.RESEND_TEST_TO?.trim();
  const to = (emailTestTo || resendTestTo || input.toEmail)?.trim();
  if (!to) {
    if (isDevEnvironment()) console.warn("[email] skipped: recipient is missing");
    return;
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "").trim();
  const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT?.trim() || 465);
  const smtpSecure = parseBoolean(process.env.SMTP_SECURE, true);
  const smtpFrom = process.env.EMAIL_FROM?.trim() || smtpUser || "";

  const { headline, subject } = getServiceEventLabels(input.locale, input.event);
  const totalPrice = (input.totalPriceCents / 100).toFixed(2);
  const serviceTimeSlot = normalizeServiceTimeSlot(input.serviceTimeSlot);

  const text =
    `${headline}\n` +
    `Service: ${input.serviceTitle}\n` +
    `Date: ${input.serviceDate}\n` +
    `Start time: ${serviceTimeSlot}\n` +
    `Participants: ${input.participants}\n` +
    `Total: EUR ${totalPrice}\n`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0b1220">
      <h2 style="margin:0 0 12px">${headline}</h2>
      <p style="margin:0 0 6px"><strong>Service:</strong> ${input.serviceTitle}</p>
      <p style="margin:0 0 6px"><strong>Date:</strong> ${input.serviceDate}</p>
      <p style="margin:0 0 6px"><strong>Start time:</strong> ${serviceTimeSlot}</p>
      <p style="margin:0 0 6px"><strong>Participants:</strong> ${input.participants}</p>
      <p style="margin:0 0 6px"><strong>Total:</strong> EUR ${totalPrice}</p>
    </div>
  `;

  if (smtpUser && smtpPass && smtpFrom) {
    try {
      const transporter = nodemailer.createTransport({
        auth: {
          pass: smtpPass,
          user: smtpUser,
        },
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
      });

      await transporter.sendMail({
        from: smtpFrom,
        html,
        subject,
        text,
        to,
      });
      return;
    } catch (error) {
      if (isDevEnvironment()) {
        console.error("[email] smtp send failed", error);
      }
      return;
    }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  if (!apiKey || !from) {
    if (isDevEnvironment()) {
      console.warn("[email] skipped: no SMTP config and missing RESEND_API_KEY/RESEND_FROM_EMAIL");
    }
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from,
        html,
        subject,
        text,
        to: [to],
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok && isDevEnvironment()) {
      const details = await response.text().catch(() => "");
      console.error(`[email] resend rejected request (${response.status})`, details);
    }
  } catch {
    if (isDevEnvironment()) {
      console.error("[email] failed to call Resend API");
    }
  }
}
