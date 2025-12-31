import {
  getPatientVaccineHistory,
  getScheduleSummary,
} from "@/app/actions/pelayanan";
import { ScheduleHeader } from "@/components/scheduleHeader";
import Pelayanan from "./clients/Pelayanan";
import { getVaccines } from "@/app/actions/vaccines";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DetailPelayanan({ params }: PageProps) {
  const { id } = await params;
  const data = await getScheduleSummary(id);
  const vaccines = await getVaccines();
  const patient = data.patients.length > 0 ? data.patients[0] : null;
  const patientId = patient ? patient.id : "";
  const vaccineHistory = await getPatientVaccineHistory(patientId);

  return (
    <div className="space-y-6">
      <ScheduleHeader
        posyanduName={data.schedule.posyandu.name}
        date={data.schedule.date}
        totalTarget={data.totalTarget}
        served={data.served}
        notServed={data.notServed}
        cancelled={data.cancelled}
      />

      <Pelayanan
        data={data}
        vaccines={vaccines}
        vaccineHistory={vaccineHistory}
      />
    </div>
  );
}
