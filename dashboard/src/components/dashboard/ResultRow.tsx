import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ResultRowData {
  id: string;
  name: string;
  value: number;
  unit: string;
  tone: "ok" | "warn";
}

export function ResultRow({
  result,
  onClick,
}: {
  result: ResultRowData;
  onClick?: () => void;
}) {
  const isWarn = result.tone === "warn";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-5 py-4",
        onClick && "cursor-pointer transition-colors hover:bg-muted/60"
      )}
    >
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          isWarn ? "bg-warning" : "bg-success"
        )}
      />
      <span className="flex-1 text-[15px] font-semibold text-foreground">
        {result.name}
      </span>
      <span
        className={cn(
          "text-[12.5px] font-semibold",
          isWarn ? "text-warning" : "text-success"
        )}
      >
        {isWarn ? "To monitor" : "Normal"}
      </span>
      <span className="font-mono w-[90px] text-right text-[15px] font-bold text-foreground">
        {result.value}{" "}
        <span className="text-faint text-[11px]">{result.unit}</span>
      </span>
      <ChevronRight size={17} strokeWidth={2} className="text-faint" />
    </div>
  );
}
