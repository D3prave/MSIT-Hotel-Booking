"use client";

import { useLanguage } from "@/components/providers/language-provider";
import type { Locale } from "@/lib/i18n/translations";

type LanguageToggleProps = {
  compact?: boolean;
  label?: string;
};

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${
        active
          ? "bg-white text-[#0b1220]"
          : "bg-white/5 text-white/60 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function LanguageToggle({ compact, label }: LanguageToggleProps) {
  const { locale, setLocale } = useLanguage();

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLocale(nextLocale);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <ToggleButton
          active={locale === "en"}
          label="EN"
          onClick={() => handleLocaleChange("en")}
        />
        <ToggleButton
          active={locale === "de"}
          label="DE"
          onClick={() => handleLocaleChange("de")}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
        {label ?? "Language"}
      </span>
      <div className="flex items-center gap-1">
        <ToggleButton
          active={locale === "en"}
          label="EN"
          onClick={() => handleLocaleChange("en")}
        />
        <ToggleButton
          active={locale === "de"}
          label="DE"
          onClick={() => handleLocaleChange("de")}
        />
      </div>
    </div>
  );
}
