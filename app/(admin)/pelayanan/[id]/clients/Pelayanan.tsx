"use client";

import { useEffect, useState } from "react";
import PatientTable from "./PatientTable";
import ImmunizationForm from "@/components/ImmunizationForm";
import { Vaccine } from "@/lib/generated/prisma/client";
import { getPatientVaccineHistory } from "@/app/actions/pelayanan";

export default function Pelayanan({
  data,
  vaccines,
}: {
  data: any;
  vaccines: Vaccine[];
}) {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [vaccineHistory, setVaccineHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedPatient) return;

    getPatientVaccineHistory(selectedPatient.id).then(setVaccineHistory);
  }, [selectedPatient]);

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* KIRI: TABLE */}
      <div className="col-span-3">
        <PatientTable
          data={data.patients}
          onSelectPatient={setSelectedPatient}
        />
      </div>

      {/* KANAN: FORM */}
      <div className="col-span-2">
        <ImmunizationForm
          patient={selectedPatient}
          vaccines={vaccines}
          scheduleId={data.schedule.id}
          vaccineHistory={vaccineHistory}
        />
      </div>
    </div>
  );
}
