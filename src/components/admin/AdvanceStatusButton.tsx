"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import type { KitStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { ApiError, postJson } from "@/lib/auth/api-client";
import { ADVANCE_ACTION_LABEL } from "@/lib/dashboard/kit-status";

export function AdvanceStatusButton({
  patientId,
  kitStatus,
}: {
  patientId: string;
  kitStatus: KitStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = ADVANCE_ACTION_LABEL[kitStatus];
  if (!label) return null;

  async function handleAdvance() {
    setLoading(true);
    setError(null);
    try {
      await postJson(`/api/admin/patients/${patientId}/advance-status`, {});
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p role="alert" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
      <Button onClick={handleAdvance} disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        {loading ? "Updating..." : label}
        {!loading && <ArrowRight size={16} />}
      </Button>
    </div>
  );
}
