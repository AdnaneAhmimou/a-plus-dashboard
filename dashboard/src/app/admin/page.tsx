import { Users, Truck, FlaskConical, FileCheck2, Package } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { DonutRing } from "@/components/dashboard/DonutRing";
import { BarChart } from "@/components/dashboard/BarChart";
import {
  ALL_KIT_STATUSES,
  KIT_STATUS_BADGE,
  kitStatusColor,
} from "@/lib/dashboard/kit-status";

function lastNMonths(n: number): Date[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const offset = n - 1 - i;
    return new Date(now.getFullYear(), now.getMonth() - offset, 1);
  });
}

export default async function AdminOverviewPage() {
  const [totalPatients, boxStatusGroups, availableBoxes, patientDates] =
    await Promise.all([
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.box.groupBy({ by: ["kitStatus"], _count: { _all: true } }),
      prisma.box.count({ where: { status: "AVAILABLE" } }),
      prisma.user.findMany({
        where: { role: "PATIENT" },
        select: { createdAt: true },
      }),
    ]);

  const kitCounts = Object.fromEntries(
    ALL_KIT_STATUSES.map((s) => [s, 0])
  ) as Record<(typeof ALL_KIT_STATUSES)[number], number>;
  for (const g of boxStatusGroups) kitCounts[g.kitStatus] = g._count._all;

  const pendingCount =
    kitCounts.PICKUP_REQUESTED + kitCounts.PICKED_UP + kitCounts.IN_TRANSIT;
  const testingCount = kitCounts.TESTING;
  const completedCount = kitCounts.RESULTS_READY;
  const totalBoxesInPipeline = ALL_KIT_STATUSES.reduce(
    (sum, s) => sum + kitCounts[s],
    0
  );

  const months = lastNMonths(6);
  const monthlyRegistrations = months.map((m) => ({
    label: m.toLocaleDateString(undefined, { month: "short" }),
    value: patientDates.filter(
      (p) =>
        p.createdAt.getFullYear() === m.getFullYear() &&
        p.createdAt.getMonth() === m.getMonth()
    ).length,
  }));

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          Laboratory portal
        </p>
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.6px] text-foreground">
          Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Users}
          label="Total patients"
          value={String(totalPatients)}
          caption="Registered accounts"
          tone="primary"
        />
        <StatCard
          icon={Truck}
          label="Pending pickup/delivery"
          value={String(pendingCount)}
          caption="Requested, picked up, or in transit"
          tone="info"
        />
        <StatCard
          icon={FlaskConical}
          label="In testing"
          value={String(testingCount)}
          caption="Samples being analyzed"
          tone="warn"
        />
        <StatCard
          icon={FileCheck2}
          label="Completed reports"
          value={String(completedCount)}
          caption="Results ready and uploaded"
          tone="success"
        />
        <StatCard
          icon={Package}
          label="Boxes available"
          value={String(availableBoxes)}
          caption="Ready to send out"
          tone="muted"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <div className="mb-5 font-display text-lg font-extrabold text-foreground">
            Samples by stage
          </div>
          {totalBoxesInPipeline === 0 ? (
            <p className="py-8 text-center text-sm font-medium text-muted-foreground">
              No boxes have been requested yet.
            </p>
          ) : (
            <div className="flex items-center gap-6">
              <DonutRing
                size={132}
                thickness={16}
                segments={ALL_KIT_STATUSES.filter((s) => kitCounts[s] > 0).map(
                  (s) => ({ value: kitCounts[s], color: kitStatusColor(s) })
                )}
                center={
                  <>
                    <div className="font-display text-2xl font-extrabold text-foreground">
                      {totalBoxesInPipeline}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                      Total
                    </div>
                  </>
                }
              />
              <ul className="flex-1 space-y-2">
                {ALL_KIT_STATUSES.map((s) => (
                  <li
                    key={s}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: kitStatusColor(s) }}
                      />
                      {KIT_STATUS_BADGE[s].label}
                    </span>
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {kitCounts[s]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-5 font-display text-lg font-extrabold text-foreground">
            New patients — last 6 months
          </div>
          <BarChart data={monthlyRegistrations} />
        </Card>
      </div>
    </div>
  );
}
