"use client";

import { useActionState, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquareQuote } from "lucide-react";
import {
  createFeedback,
  type CreateFeedbackActionState,
} from "@/app/actions/feedback";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";

const initialState: CreateFeedbackActionState = { error: null, success: null };

export function GuestFeedback() {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [state, formAction, isPending] = useActionState(createFeedback, initialState);
  const [activeIndex, setActiveIndex] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  const testimonials = t.home.feedbackTestimonials;
  const maxIndex = Math.max(testimonials.length - 1, 0);

  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(0);
    }
  }, [activeIndex, maxIndex]);

  useEffect(() => {
    if (state.error) {
      addToast(state.error, "error");
    }
  }, [addToast, state]);

  useEffect(() => {
    if (state.success) {
      addToast(state.success, "success");
      setName("");
      setComment("");
    }
  }, [addToast, state]);

  const goPrevious = () => {
    if (testimonials.length <= 1) return;
    setActiveIndex((current) => (current === 0 ? maxIndex : current - 1));
  };

  const goNext = () => {
    if (testimonials.length <= 1) return;
    setActiveIndex((current) => (current === maxIndex ? 0 : current + 1));
  };

  return (
    <section id="feedback" className="mx-auto w-full max-w-6xl px-4 pt-8 scroll-mt-24 md:pt-12">
      <div className="reveal reveal-header mb-10 border-l-4 border-[#3d2b1f] pl-4 text-left md:mb-12 md:pl-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white uppercase sm:text-4xl">
          {t.home.feedbackTitle}
        </h2>
        <p className="mt-2 text-base text-white/65 md:text-lg">{t.home.feedbackSubtitle}</p>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/50 md:text-base">
          {t.home.feedbackIntro}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <article className="reveal reveal-card overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-4 py-3 md:px-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a87f5d]">
              {t.home.feedbackClientVoices}
            </p>
          </div>

          <div className="overflow-hidden p-4 md:p-5">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((item) => (
                <div key={`${item.author}-${item.role}`} className="w-full flex-none pr-1">
                  <MessageSquareQuote className="text-[#a87f5d]" size={22} />
                  <p className="mt-3 min-h-[7.5rem] text-sm leading-relaxed text-white/80 md:text-base">
                    "{item.quote}"
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-bold text-white">{item.author}</p>
                    <p className="text-xs uppercase tracking-[0.12em] text-white/45">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                {activeIndex + 1}/{Math.max(testimonials.length, 1)}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrevious}
                  aria-label={t.home.feedbackPrev}
                  className="rounded-md border border-white/15 bg-[#0b1220]/60 p-2 text-white/75 transition-colors hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={t.home.feedbackNext}
                  className="rounded-md border border-white/15 bg-[#0b1220]/60 p-2 text-white/75 transition-colors hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="reveal reveal-card overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-4 py-3 md:px-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a87f5d]">
              {t.home.feedbackFormTitle}
            </p>
          </div>

          <form action={formAction} className="p-4 md:p-5">
            <label className="mb-3 flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
              {t.home.feedbackNameLabel}
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.home.feedbackNamePlaceholder}
                className="rounded-xl border border-white/15 bg-[#0b1220]/60 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#a87f5d]"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
              {t.home.feedbackCommentLabel}
              <textarea
                name="comment"
                rows={6}
                maxLength={1200}
                required
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t.home.feedbackCommentPlaceholder}
                className="rounded-xl border border-white/15 bg-[#0b1220]/60 px-3 py-2.5 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#a87f5d]"
              />
            </label>

            <p className="mt-2 text-xs leading-relaxed text-white/45">{t.home.feedbackFormHint}</p>

            <button
              type="submit"
              disabled={isPending}
              className="mt-3 w-full rounded-lg bg-[#3d2b1f] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#513625] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? t.home.feedbackSubmitting : t.home.feedbackSubmit}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
