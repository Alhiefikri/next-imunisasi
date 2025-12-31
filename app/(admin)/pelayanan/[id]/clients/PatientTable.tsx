"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function PatientTable({
  data,
  onSelectPatient,
}: {
  data: any[];
  onSelectPatient: (patient: any) => void;
}) {
  console.log("PatientTable data:", data);
  return (
    <div className="rounded-md border">
      <DataTable columns={columns} data={data} onRowClick={onSelectPatient} />
    </div>
  );
}
