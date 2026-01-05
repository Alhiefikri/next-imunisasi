"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns";

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

interface PatientTableProps {
  patients: PatientWithStatus[];
  onSelectPatient: (patient: PatientWithStatus) => void;
  selectedId?: string;
}

export default function PatientTable({
  patients,
  onSelectPatient,
  selectedId,
}: PatientTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <DataTable
        columns={columns}
        data={patients}
        onRowClick={onSelectPatient}
        selectedId={selectedId}
      />
    </div>
  );
}
