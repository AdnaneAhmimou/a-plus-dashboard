import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KitStatusBadge } from "@/components/admin/KitStatusBadge";
import { AdvanceStatusButton } from "@/components/admin/AdvanceStatusButton";
import { UploadReportForm } from "@/components/admin/UploadReportForm";
import { PatientInfoCard } from "@/components/admin/PatientInfoCard";
import { ReportList } from "@/components/reports/ReportList";
import { JourneyRail } from "@/components/dashboard/JourneyRail";
import {
  KIT_STEPS,
  KIT_STATUS_COPY,
  getKitActiveIndex,
} from "@/lib/dashboard/kit-status";

export default async function AdminPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await prisma.user.findUnique({
    where: { id },
    include: { box: true },
  });

  if (!patient || patient.role !== "PATIENT") notFound();

  const kitStatus = patient.box?.kitStatus ?? "NOT_REQUESTED";
  const activeIndex = getKitActiveIndex(kitStatus);

  const reports = patient.box
    ? await prisma.report.findMany({
        where: { boxId: patient.box.id },
        include: { uploadedBy: { select: { firstName: true, lastName: true } } },
        orderBy: { version: "desc" },
      })
    : [];

  const analysisResultCount = patient.box
    ? await prisma.analysisResult.count({ where: { boxId: patient.box.id } })
    : 0;

  return (
    <div>
      <Link
        href="/admin/patients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft size={16} />
        Back to patients
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.6px] text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <div className="mt-2">
            <KitStatusBadge status={kitStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <PatientInfoCard
          patient={{
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone,
            boxNumber: patient.box?.number ?? null,
            registeredLabel: patient.createdAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          }}
        />

        <Card className="p-6">
          <div className="mb-5 font-display text-lg font-extrabold text-foreground">
            DNA Test Tracking
          </div>
          <div className="px-1 py-1">
            <JourneyRail steps={KIT_STEPS} activeIndex={activeIndex} />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold text-muted-foreground">
              {patient.box ? KIT_STATUS_COPY[kitStatus] : "No box associated with this patient"}
            </span>
            {patient.box && (
              <AdvanceStatusButton patientId={patient.id} kitStatus={kitStatus} />
            )}
          </div>
          {patient.box?.courierReferenceNumber && (
            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Courier tracking (Chrono Diali)</span>
              <span className="font-mono text-foreground">
                {patient.box.courierReferenceNumber}
              </span>
            </div>
          )}
        </Card>
      </div>

      {patient.box && (
        <Card className="mt-5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-display text-lg font-extrabold text-foreground">
              DNA Test Reports
            </div>
            {analysisResultCount > 0 && (
              <Link href={`/admin/patients/${patient.id}/results`}>
                <Button type="button" variant="secondary" size="sm">
                  <Sparkles size={14} />
                  View structured results
                </Button>
              </Link>
            )}
          </div>
          <UploadReportForm patientId={patient.id} />
          <div className="mt-4">
            <ReportList
              patientId={patient.id}
              reports={reports.map((r) => ({
                id: r.id,
                version: r.version,
                fileName: r.fileName,
                fileSize: r.fileSize,
                createdAt: r.createdAt,
                uploadedByName: `${r.uploadedBy.firstName} ${r.uploadedBy.lastName}`,
              }))}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
