This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Booking Email Notifications

Booking emails are already wired in server actions (`create`, `confirm`, `cancel`).

### Real customers (recommended, no domain required): Gmail SMTP

Set these in `web/.env.local` (and production env vars if deployed):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=denkraum1886.stays@gmail.com
SMTP_PASS=your_16_char_google_app_password
EMAIL_FROM=DENKRAUM <denkraum1886.stays@gmail.com>
```

Optional testing helper:

```env
EMAIL_TEST_TO=your-email@example.com
```

If `EMAIL_TEST_TO` is set, every booking notification is routed to that mailbox.

### Fallback/demo mode: Resend

If you do not own a domain, use this:

```env
RESEND_API_KEY=re_xxxxxxxxx
RESEND_TEST_TO=your_resend_account_email@example.com
```

Leave `RESEND_FROM_EMAIL` empty. The app will use `onboarding@resend.dev`.

Note: in this mode, Resend only allows sending to your own verified account email.
