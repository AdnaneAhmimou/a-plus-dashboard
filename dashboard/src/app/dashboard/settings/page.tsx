import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { Card } from "@/components/ui/card";
import { LanguageSelect } from "@/components/settings/LanguageSelect";
import { DeleteAccountCard } from "@/components/settings/DeleteAccountCard";

export default async function PatientSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("settings");
  // The confirmation word is translated, so it is read here rather than
  // hardcoded in the client component: a French patient types SUPPRIMER.
  const del = await getTranslations("deleteAccount");
  const nav = await getTranslations("nav");

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          {nav("patientSpace")}
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

      <Card className="mt-5 p-6">
        <h2 className="mb-4 font-display text-base font-bold text-foreground">
          {t("account")}
        </h2>
        <dl className="divide-y divide-border text-sm">
          <Row label={t("name")} value={`${user.firstName} ${user.lastName}`} />
          <Row label={t("email")} value={user.email} />
          {user.box && <Row label={t("kit")} value={user.box.number} mono />}
        </dl>
      </Card>

      <div className="mt-5">
        <DeleteAccountCard confirmWord={del("confirmWord")} />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className={`font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
