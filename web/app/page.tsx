import { Hero } from "@/components/marketing/hero";

export default function HomePage() {
  return (
    <div>
      <Hero />

      <section id="rooms" className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-2xl font-semibold">Rooms (placeholder)</h2>
        <p className="mt-2 text-white/70">
          Next step: fetch public rooms from Supabase and show cards here.
        </p>
      </section>
    </div>
  );
}