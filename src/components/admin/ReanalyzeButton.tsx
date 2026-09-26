"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { ApiError, postJson } from "@/lib/auth/api-client";

// Per-row re-analyze action in the report list — each report is now an
// independent single-trait PDF (not a version of one consolidated
// report), so re-running AI extraction needs to target one specific
// report, not "the latest one."
export function ReanalyzeButton({
  patientId,
  reportId,
}: {
  patientId: string;
  reportId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await postJson(
        `/api/admin/patients/${patientId}/reports/${reportId}/analyze`,
        {}
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="Re-analyze with AI"
        title="Re-analyze with AI"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
      </button>
      {error && (
        <p
          role="alert"
          className="absolute top-full right-0 z-10 mt-1 w-40 rounded-md border border-border bg-card p-2 text-[11px] font-semibold text-destructive shadow-md"
        >
          {error}
        </p>
      )}
    </div>
  );
}
