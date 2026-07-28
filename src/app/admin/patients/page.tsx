import { prisma } from "@/lib/prisma";
import { PatientTable } from "@/components/admin/PatientTable";

export default async function AdminPatientsPage() {
  const users = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      box: { select: { number: true, kitStatus: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const patients = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    boxNumber: u.box?.number ?? null,
    kitStatus: u.box?.kitStatus ?? ("NOT_REQUESTED" as const),
  }));

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          Laboratory portal
        </p>
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.6px] text-foreground">
          Patients
        </h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {patients.length} registered patient
          {patients.length === 1 ? "" : "s"}
        </p>
      </div>

      <PatientTable patients={patients} />
    </div>
  );
}
