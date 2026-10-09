// The languages the portal is offered in. Arabic carries its writing
// direction, which the root layout puts on <html> so the whole interface
// mirrors rather than just the text.
//
// `label` is deliberately written in the language itself: someone who
// cannot read the current interface language still has to be able to
// find their own in the list.

export const LOCALES = ["en", "fr", "es", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<
  Locale,
  { label: string; english: string; dir: "ltr" | "rtl" }
> = {
  en: { label: "English", english: "English", dir: "ltr" },
  fr: { label: "Français", english: "French", dir: "ltr" },
  es: { label: "Español", english: "Spanish", dir: "ltr" },
  ar: { label: "العربية", english: "Arabic", dir: "rtl" },
};

/** The cookie the chosen language is remembered in. */
export const LOCALE_COOKIE = "aplus_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return LOCALE_META[locale].dir;
}
