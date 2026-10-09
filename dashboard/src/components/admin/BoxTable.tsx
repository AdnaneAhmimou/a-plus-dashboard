"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { BoxStatus, KitStatus } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BoxStatusBadge } from "@/components/admin/BoxStatusBadge";
import { KitStatusBadge } from "@/components/admin/KitStatusBadge";
import { MarkSentButton } from "@/components/admin/MarkSentButton";

export interface AdminBoxRow {
  id: string;
  number: string;
  status: BoxStatus;
  kitStatus: KitStatus;
  patient: { id: string; firstName: string; lastName: string } | null;
}

export function BoxTable({ boxes }: { boxes: AdminBoxRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boxes;
    return boxes.filter((b) =>
      [
        b.number,
        b.patient ? `${b.patient.firstName} ${b.patient.lastName}` : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [boxes, query]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search
          size={16}
          strokeWidth={1.9}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by box number or patient..."
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Box number
                </th>
                <th className="px-5 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Patient
                </th>
                <th className="px-5 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Kit progress
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border last:border-0 hover:bg-muted"
                >
                  <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-foreground">
                    {b.number}
                  </td>
                  <td className="px-5 py-3.5">
                    <BoxStatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    {b.patient ? (
                      <Link
                        href={`/admin/patients/${b.patient.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {b.patient.firstName} {b.patient.lastName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        Not associated
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {b.patient ? (
                      <KitStatusBadge status={b.kitStatus} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {b.status === "AVAILABLE" && (
                      <MarkSentButton boxId={b.id} />
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm font-medium text-muted-foreground"
                  >
                    No boxes match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
