"use client";

import { ColumnDef } from "@tanstack/react-table";
import { cn, getAgeDetails } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Pastikan sudah install badge shadcn
import { User, Users } from "lucide-react";

export type PatientRow = {
  id: string;
  name: string;
  birthDate: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  motherName: string;
  status: "WAITING" | "SERVED" | "CANCELLED";
};

export const columns: ColumnDef<PatientRow>[] = [
  {
    accessorKey: "name",
    header: "Informasi Anak",
    cell: ({ row }) => {
      const gender = row.original.gender;
      return (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 leading-none">
              {row.original.name}
            </span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                gender === "LAKI_LAKI"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-pink-100 text-pink-700"
              )}
            >
              {gender === "LAKI_LAKI" ? "L" : "P"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {getAgeDetails(new Date(row.original.birthDate))}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "motherName",
    header: "Orang Tua / Wali",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-slate-600">
        <Users className="w-3.5 h-3.5 opacity-50" />
        <span className="text-sm font-medium">{row.original.motherName}</span>
      </div>
    ),
  },

  {
    accessorKey: "status",
    header: "Status Antrean",
    cell: ({ row }) => {
      const status = row.original.status;

      const config = {
        WAITING: {
          label: "Menunggu",
          class: "bg-amber-50 text-amber-700 border-amber-200",
        },
        SERVED: {
          label: "Selesai",
          class: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        CANCELLED: {
          label: "Batal / Tidak Layak",
          class: "bg-red-50 text-red-700 border-red-200",
        },
      };

      const current = config[status];

      return (
        <div className="flex justify-start">
          <div
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-bold border",
              current.class
            )}
          >
            {current.label}
          </div>
        </div>
      );
    },
  },
];
