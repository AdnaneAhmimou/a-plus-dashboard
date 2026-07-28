"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError, postJson } from "@/lib/auth/api-client";

export function AnalyzeReportButton({
  patientId,
  reportId,
  hasResults,
}: {
  patientId: string;
  reportId: string;
  hasResults: boolean;
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
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} />
        )}
        {hasResults ? "Re-analyze with AI" : "Analyze with AI"}
      </Button>
      {error && (
        <p role="alert" className="mt-1.5 max-w-xs text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
