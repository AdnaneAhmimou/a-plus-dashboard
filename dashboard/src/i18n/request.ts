import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";

// Locale comes from a cookie, not from the URL.
//
// next-intl's documented default is a `/[locale]/...` path segment, which
// would mean restructuring every route in the app and rewriting every
// internal link, redirect and middleware match. The portal is a private,
// logged-in tool: nobody links to `/fr/dashboard`, there is no SEO reason
// to have per-language URLs, and a patient's language is a preference
// belonging to them rather than to the address. A cookie says exactly
// that and leaves the routing alone.
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieValue = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
