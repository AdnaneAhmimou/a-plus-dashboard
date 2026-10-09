import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { LanguageSelect } from "@/components/settings/LanguageSelect";
import { DeleteAccountCard } from "@/components/settings/DeleteAccountCard";

// The admin settings page carries the same language picker as the
// patient one. The preference is per browser, not per role, so an admin
// who also has a patient account sees one consistent interface language.
export default async function AdminSettingsPage() {
  const t = await getTranslations("settings");
  // The confirmation word is translated, so it is read here rather than
  // hardcoded in the client component: a French patient types SUPPRIMER.
  const del = await getTranslations("deleteAccount");
  const nav = await getTranslations("nav");

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          {nav("admin")}
        </p>
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.6px] text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <Card className="p-6">
        <LanguageSelect />
      </Card>

      <div className="mt-5">
        <DeleteAccountCard confirmWord={del("confirmWord")} />
      </div>
    </div>
  );
}
