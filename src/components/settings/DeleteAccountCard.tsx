"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Permanent account deletion.
 *
 * Deliberately awkward to trigger: the destructive button only appears
 * after an explicit "delete my account" step, and then requires both the
 * account password and typing a confirmation word. This is the one
 * action in the portal that destroys a patient's genetic results with no
 * way back, so a single misplaced click must not be able to do it.
 *
 * The copy states exactly what disappears rather than saying "this
 * cannot be undone" and leaving the person to guess the scope.
 */
export function DeleteAccountCard({ confirmWord }: { confirmWord: string }) {
  const t = useTranslations("deleteAccount");
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const confirmed =
    confirmation.trim().toLowerCase() === confirmWord.toLowerCase() &&
    password.length > 0;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!confirmed || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? t("genericError"));
        return;
      }

      // The session cookies are already cleared by the response; a full
      // navigation rather than a router push, so no stale server-rendered
      // page for a user that no longer exists can remain in the cache.
      window.location.href = "/login";
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-destructive/30 p-6">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={16} strokeWidth={2} className="text-destructive" />
        <h2 className="font-display text-base font-bold text-foreground">
          {t("title")}
        </h2>
      </div>

      <p className="text-sm leading-relaxed font-medium text-muted-foreground">
        {t("description")}
      </p>

      <ul className="mt-3 space-y-1.5 text-sm font-medium text-muted-foreground">
        {["results", "reports", "account", "kit"].map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-destructive">
              &bull;
            </span>
            {t(`erases.${item}`)}
          </li>
        ))}
      </ul>

      {!open ? (
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
            onClick={() => setOpen(true)}
          >
            {t("start")}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="delete-password"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              {t("passwordLabel")}
            </label>
            <Input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="delete-confirm"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              {t("confirmLabel", { word: confirmWord })}
            </label>
            <Input
              id="delete-confirm"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive-surface px-3 py-2 text-sm font-semibold text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={!confirmed || submitting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {submitting ? t("deleting") : t("confirmButton")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setPassword("");
                setConfirmation("");
                setError(null);
                router.refresh();
              }}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
