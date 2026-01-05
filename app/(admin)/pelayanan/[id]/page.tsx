import { getVaccines } from "@/app/actions/vaccines";
import { ScheduleHeader } from "@/components/scheduleHeader";
import Pelayanan from "./clients/Pelayanan";
import {
  getCandidatePatients,
  getScheduleSummary,
} from "@/app/actions/pelayanan";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DetailPelayanan({ params }: PageProps) {
  const { id } = await params;

  const [summary, vaccines, candidates] = await Promise.all([
    getScheduleSummary(id),
    getVaccines(),
    getCandidatePatients(id),
  ]);

  return (
    <div className="space-y-6">
      <ScheduleHeader
        posyanduName={summary.schedule.posyandu.name}
        date={summary.schedule.date}
        stats={summary.stats}
      />

      <Pelayanan
        scheduleId={id}
        summary={summary}
        vaccines={vaccines}
        candidates={candidates}
      />
    </div>
  );
}
