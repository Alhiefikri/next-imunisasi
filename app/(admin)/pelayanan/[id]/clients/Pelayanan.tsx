"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import PatientTable from "./PatientTable";
import ImmunizationForm from "@/components/ImmunizationForm";
import AddExternalPatientDialog from "@/components/AddExtermalPatientDialog";
import { Button } from "@/components/ui/button";

import type { Vaccine, Patient } from "@/lib/generated/prisma/client";
import CompleteScheduleButton from "@/components/CompleteScheduleButton";

type PatientWithStatus = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  motherName: string | null;
  nik: string | null;
  status: "WAITING" | "SERVED" | "CANCELLED";
  recordId?: string;
  vaccineCount?: number;
};

type SummaryData = {
  schedule: {
    id: string;
    date: string;
    status: string;
    notes: string | null;
    posyandu: any;
  };
  stats: {
    totalTarget: number;
    served: number;
    waiting: number;
    cancelled: number;
    totalVaccines: number;
  };
  patients: PatientWithStatus[];
};

interface PelayananProps {
  scheduleId: string;
  summary: SummaryData;
  vaccines: Vaccine[];
  candidates: Patient[];
}

export default function Pelayanan({
  scheduleId,
  summary,
  vaccines,
  candidates,
}: PelayananProps) {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] =
    useState<PatientWithStatus | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handlePatientAdded = () => {
    setShowDialog(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pelayanan Imunisasi</h1>
          <p className="text-sm text-muted-foreground">
            {summary.schedule.posyandu.name} -{" "}
            {new Date(summary.schedule.date).toLocaleDateString("id-ID")}
          </p>
        </div>

        <div className="flex gap-2">
          <CompleteScheduleButton
            scheduleId={scheduleId}
            isCompleted={summary.schedule.status === "COMPLETED"}
            waitingCount={summary.stats.waiting}
            totalServed={summary.stats.served + summary.stats.cancelled}
          />
          <Button onClick={() => setShowDialog(true)} size="sm">
            + Tambah Pasien
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Table */}
        <div className="lg:col-span-3">
          <PatientTable
            patients={summary.patients}
            onSelectPatient={setSelectedPatient}
            selectedId={selectedPatient?.id}
          />
        </div>

        {/* Form */}

        <div className="lg:col-span-2">
          <ImmunizationForm
            scheduleId={scheduleId}
            patient={selectedPatient}
            vaccines={vaccines}
            onSaved={() => router.refresh()}
            isLocked={summary.schedule.status === "COMPLETED"}
          />
        </div>
      </div>

      <AddExternalPatientDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        candidates={candidates}
        scheduleId={scheduleId}
        onSuccess={handlePatientAdded}
        isLocked={summary.schedule.status === "COMPLETED"}
      />
    </>
  );
}
