"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError, postJson } from "@/lib/auth/api-client";

export function MarkSentButton({ boxId }: { boxId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkSent() {
    setLoading(true);
    setError(null);
    try {
      await postJson(`/api/admin/boxes/${boxId}/mark-sent`, {});
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleMarkSent}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" /> : <Truck size={14} />}
        Mark as sent
      </Button>
      {error && (
        <p role="alert" className="text-[11px] font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
