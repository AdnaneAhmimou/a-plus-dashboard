import { NextRequest, NextResponse } from "next/server";

import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";

// Sets the interface language. A cookie rather than a column on User so
// the choice also works before anyone signs in and so switching language
// never needs a database write. One year, so it survives between visits.
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const locale = (body as { locale?: unknown } | null)?.locale;

  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
  return response;
}
