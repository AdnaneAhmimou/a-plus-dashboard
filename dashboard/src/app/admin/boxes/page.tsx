import { prisma } from "@/lib/prisma";
import { AddBoxForm } from "@/components/admin/AddBoxForm";
import { BoxTable } from "@/components/admin/BoxTable";

export default async function AdminBoxesPage() {
  const boxes = await prisma.box.findMany({
    select: {
      id: true,
      number: true,
      status: true,
      kitStatus: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = boxes.map((b) => ({
    id: b.id,
    number: b.number,
    status: b.status,
    kitStatus: b.kitStatus,
    patient: b.user,
  }));

  const availableCount = boxes.filter((b) => b.status === "AVAILABLE").length;
  const sentCount = boxes.filter((b) => b.status === "SENT").length;
  const associatedCount = boxes.filter((b) => b.status === "ASSOCIATED").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
            Laboratory portal
          </p>
          <h1 className="font-display text-[28px] font-extrabold tracking-[-0.6px] text-foreground">
            Boxes
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {boxes.length} total · {availableCount} available · {sentCount}{" "}
            sent · {associatedCount} associated
          </p>
        </div>
        <AddBoxForm />
      </div>

      <BoxTable boxes={rows} />
    </div>
  );
}
