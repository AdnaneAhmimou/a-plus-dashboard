"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/locales";

/**
 * The language picker. Writes the choice to a cookie through
 * /api/settings/locale, then refreshes so the server components
 * re-render with the new messages — the whole interface is server
 * rendered, so a client-side state change alone would not translate it.
 *
 * Each option shows its own language in its own script, so someone who
 * cannot read the current interface language can still find theirs.
 */
export function LanguageSelect() {
  const t = useTranslations("settings");
  const active = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState<Locale | null>(null);

  const choose = async (locale: Locale) => {
    if (locale === active) return;
    setSaving(locale);
    try {
      const res = await fetch("/api/settings/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) return;
      startTransition(() => router.refresh());
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <Languages size={16} strokeWidth={2} className="text-muted-foreground" />
        <h2 className="font-display text-base font-bold text-foreground">
          {t("language")}
        </h2>
      </div>
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {t("languageHelp")}
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {LOCALES.map((locale) => {
          const meta = LOCALE_META[locale];
          const isActive = locale === active;
          return (
            <button
              key={locale}
              type="button"
              onClick={() => choose(locale)}
              disabled={pending || saving !== null}
              aria-pressed={isActive}
              // The option is rendered in its own direction so Arabic
              // reads correctly even while the interface is in English.
              dir={meta.dir}
              className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-start transition-colors disabled:opacity-60 ${
                isActive
                  ? "border-primary bg-secondary"
                  : "border-border hover:bg-muted/60"
              }`}
            >
              <span>
                <span className="block text-sm font-bold text-foreground">
                  {meta.label}
                </span>
                <span className="block text-xs font-medium text-muted-foreground">
                  {meta.english}
                </span>
              </span>
              {isActive && (
                <Check size={16} strokeWidth={2.5} className="shrink-0 text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
