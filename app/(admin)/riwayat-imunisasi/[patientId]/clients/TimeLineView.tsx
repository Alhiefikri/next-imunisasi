"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CheckCircle2,
  XCircle,
  Syringe,
  Calendar as CalendarIcon,
  MapPin,
  User2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  histories: any[]; // Data dari vaccineHistories
  records: any[]; // Data dari immunizationRecords
}

export default function TimelineView({
  histories,
  records,
}: TimelineViewProps) {
  // 1. Gabungkan dan urutkan data berdasarkan tanggal terbaru
  // Kita ingin melihat apa yang terjadi di setiap kunjungan
  const allEvents = records
    .map((record) => {
      // Cari apakah di kunjungan (record) ini ada vaksin yang diberikan?
      const vaccinesInThisVisit = histories.filter(
        (h) => h.scheduleId === record.scheduleId
      );

      return {
        date: new Date(record.schedule.date),
        status: record.status, // SERVED, CANCELLED, WAITING
        notes: record.notes,
        posyandu: record.schedule.posyandu?.name || "Posyandu",
        vaccines: vaccinesInThisVisit,
        id: record.id,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
        <p>Belum ada riwayat kunjungan</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {allEvents.map((event, index) => (
        <div
          key={event.id}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
        >
          {/* Dot Indicator */}
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-300",
              event.status === "SERVED"
                ? "bg-emerald-500 text-white"
                : event.status === "CANCELLED"
                ? "bg-rose-500 text-white"
                : "bg-slate-400 text-white"
            )}
          >
            {event.status === "SERVED" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : event.status === "CANCELLED" ? (
              <XCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>

          {/* Content Card */}
          <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <time className="font-bold text-slate-900">
                {format(event.date, "dd MMMM yyyy", { locale: idLocale })}
              </time>
              <div
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  event.status === "SERVED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                )}
              >
                {event.status === "SERVED" ? "Berhasil" : "Batal/Tunda"}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <MapPin className="h-3 w-3" />
              <span>{event.posyandu}</span>
            </div>

            {/* List Vaksin yang disuntikkan */}
            {event.vaccines.length > 0 ? (
              <div className="space-y-2 mt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Vaksin Diberikan:
                </p>
                {event.vaccines.map((v: any) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100"
                  >
                    <div className="bg-primary/10 p-1.5 rounded-md">
                      <Syringe className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {v.vaccine.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Dosis ke-{v.doseNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : event.status === "CANCELLED" ? (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">
                  Alasan Penundaan:
                </p>
                <p className="text-sm text-rose-700 italic">
                  "{event.notes || "Tidak ada keterangan"}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic mt-2">
                Hanya kunjungan pemeriksaan umum
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
