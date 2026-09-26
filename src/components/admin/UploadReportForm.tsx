"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError, postFormData, postJson } from "@/lib/auth/api-client";

type FileStatus = "pending" | "uploading" | "analyzing" | "done" | "error";

interface FileProgress {
  name: string;
  status: FileStatus;
  message?: string;
}

// Each source PDF is one trait/condition (see prepare-report-text.ts) —
// admins upload a batch of them at once for a patient, so this uploads
// AND analyzes every selected file sequentially (one at a time, not in
// parallel, so a slow/failing file doesn't race the others and the
// per-file status list stays easy to follow) rather than requiring a
// separate manual "Analyze" click per file.
export function UploadReportForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<FileProgress[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(fileInputRef.current?.files ?? []);
    if (files.length === 0) return;

    setLoading(true);
    setProgress(files.map((f) => ({ name: f.name, status: "pending" })));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: "uploading" } : p))
      );

      try {
        const formData = new FormData();
        formData.set("file", file);
        const { report } = await postFormData<{ report: { id: string } }>(
          `/api/admin/patients/${patientId}/reports`,
          formData
        );

        setProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "analyzing" } : p))
        );
        await postJson(
          `/api/admin/patients/${patientId}/reports/${report.id}/analyze`,
          {}
        );

        setProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "done" } : p))
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed";
        setProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "error", message } : p))
        );
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-foreground hover:file:bg-muted"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Upload size={14} />}
          {loading ? "Uploading..." : "Upload & analyze"}
        </Button>
      </div>

      {progress.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3">
          {progress.map((p, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              {p.status === "done" && (
                <CheckCircle2 size={14} className="shrink-0 text-success" />
              )}
              {p.status === "error" && (
                <XCircle size={14} className="shrink-0 text-destructive" />
              )}
              {(p.status === "uploading" || p.status === "analyzing") && (
                <Loader2 size={14} className="shrink-0 animate-spin text-primary" />
              )}
              {p.status === "pending" && (
                <div className="size-3.5 shrink-0 rounded-full border border-border" />
              )}
              <span className="truncate font-medium text-foreground">{p.name}</span>
              <span className="shrink-0 text-faint">
                {p.status === "uploading" && "uploading..."}
                {p.status === "analyzing" && "analyzing..."}
                {p.status === "error" && (p.message ?? "failed")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
