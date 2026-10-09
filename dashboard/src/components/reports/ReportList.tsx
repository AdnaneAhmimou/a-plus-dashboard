import { Download, FileText } from "lucide-react";

import { ReanalyzeButton } from "@/components/admin/ReanalyzeButton";

export interface ReportListItem {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  createdAt: Date;
  uploadedByName?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReportList({
  reports,
  showUploader = true,
  patientId,
}: {
  reports: ReportListItem[];
  showUploader?: boolean;
  /** Admin context only — when set, each row gets a re-analyze action. */
  patientId?: string;
}) {
  if (reports.length === 0) {
    return (
      <p className="py-6 text-center text-sm font-medium text-muted-foreground">
        No reports uploaded yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {reports.map((r) => (
        <li key={r.id} className="flex items-center gap-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <FileText size={16} strokeWidth={1.8} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              {r.fileName}{" "}
              <span className="font-mono text-xs font-medium text-muted-foreground">
                v{r.version}
              </span>
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              {r.createdAt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              · {formatSize(r.fileSize)}
              {showUploader && r.uploadedByName ? ` · ${r.uploadedByName}` : ""}
            </div>
          </div>
          {patientId && <ReanalyzeButton patientId={patientId} reportId={r.id} />}
          <a
            href={`/api/reports/${r.id}/download`}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary"
            aria-label={`Download ${r.fileName}`}
          >
            <Download size={16} />
          </a>
        </li>
      ))}
    </ul>
  );
}
