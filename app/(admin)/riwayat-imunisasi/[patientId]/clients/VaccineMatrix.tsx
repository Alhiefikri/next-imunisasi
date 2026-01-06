"use client";

import { Check, Clock, AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface VaccineMatrixProps {
  histories: any[];
  masterVaccines: any[];
  ageMonths: number;
}

export default function VaccineMatrix({
  histories,
  masterVaccines,
  ageMonths,
}: VaccineMatrixProps) {
  // Fungsi Helper untuk menentukan status vaksin
  const getVaccineStatus = (vaccine: any) => {
    // Sesuai Zod: vaccine.id, vaccine.totalDoses, vaccine.ageMonthMin
    const history = histories.filter((h) => h.vaccineId === vaccine.id);
    const isTaken = history.length > 0;

    // 1. Sudah diambil (Lengkap atau sebagian)
    if (isTaken) {
      // Menghitung dosis tertinggi yang sudah diterima
      const latestDose = Math.max(...history.map((h) => h.doseNumber || 1));
      const isFullyComplete = latestDose >= vaccine.totalDoses;

      return {
        status: isFullyComplete ? "COMPLETE" : "PARTIAL",
        label: isFullyComplete
          ? "Lengkap"
          : `Dosis ${latestDose}/${vaccine.totalDoses}`,
        icon: Check,
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      };
    }

    // 2. Belum diambil, cek apakah sudah lewat jadwalnya (Missed)
    // Sesuai Zod: Pakai ageMonthMin
    if (ageMonths > (vaccine.ageMonthMin || 0) + 2) {
      return {
        status: "MISSED",
        label: "Terlewat",
        icon: ShieldAlert,
        color: "text-rose-600 bg-rose-50 border-rose-200",
      };
    }

    // 3. Belum waktunya (Future)
    if (ageMonths < (vaccine.ageMonthMin || 0)) {
      return {
        status: "FUTURE",
        label: `Mulai Usia ${vaccine.ageMonthMin} Bln`,
        icon: Clock,
        color: "text-slate-400 bg-slate-50 border-slate-200",
      };
    }

    // 4. Seharusnya sekarang (Due)
    return {
      status: "DUE",
      label: "Jadwal Sekarang",
      icon: AlertCircle,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    };
  };

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[280px]">Nama Vaksin</TableHead>
            <TableHead>Target Usia</TableHead>
            <TableHead>Dosis Wajib</TableHead>
            <TableHead className="text-right">Status Kelengkapan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {masterVaccines.map((vaccine) => {
            const info = getVaccineStatus(vaccine);
            const Icon = info.icon;

            return (
              <TableRow key={vaccine.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm">{vaccine.name}</span>
                    <span className="text-[10px] text-muted-foreground font-normal line-clamp-1">
                      {vaccine.description || "Perlindungan dasar"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {vaccine.ageMonthMin === 0
                    ? "Baru Lahir"
                    : `${vaccine.ageMonthMin} Bulan`}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {vaccine.totalDoses} Dosis
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold shadow-sm whitespace-nowrap",
                      info.color
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {info.label}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
