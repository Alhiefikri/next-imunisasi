import { getMonthlyReport } from "@/app/actions/laporan";
import ReportClient from "./_components/report-client";

export default async function LaporanPage() {
  const now = new Date();
  const initialData = await getMonthlyReport(
    now.getMonth() + 1,
    now.getFullYear()
  );

  const months = [
    { label: "Januari", value: 1 },
    { label: "Februari", value: 2 },
    // ... dst
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan Bulanan</h1>
        <p className="text-sm text-slate-500">
          Rekapitulasi cakupan imunisasi dan statistik bulanan
        </p>
      </div>

      <ReportClient
        initialData={initialData}
        months={months}
        years={[2025, 2026]}
      />
    </div>
  );
}
