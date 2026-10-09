"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import type { KitStatus } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { KitStatusBadge } from "@/components/admin/KitStatusBadge";

export interface AdminPatientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  boxNumber: string | null;
  kitStatus: KitStatus;
}

export function PatientTable({ patients }: { patients: AdminPatientRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      [`${p.firstName} ${p.lastName}`, p.email, p.boxNumber ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [patients, query]);

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
          placeholder="Search by name, email, or box number..."
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Patient
                </th>
                <th className="px-5 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Email
                </th>
                <th className="px-5 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Box number
                </th>
                <th className="px-5 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/admin/patients/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/admin/patients/${p.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`View ${p.firstName} ${p.lastName}`}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <td className="px-5 py-3.5 font-semibold text-foreground">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {p.email}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[13px] text-muted-foreground">
                    {p.boxNumber ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <KitStatusBadge status={p.kitStatus} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ChevronRight size={18} className="ml-auto text-muted-foreground" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm font-medium text-muted-foreground"
                  >
                    No patients match your search.
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
