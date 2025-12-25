"use client";

import { Button } from "@/components/ui/button";
import { Patient } from "@/lib/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MapPin, Phone } from "lucide-react";
import CellActions from "./cell-actions";
import { GENDER_LABEL } from "@/lib/constants";
import { cn, getAgeDetails } from "@/lib/utils";

export const columns: ColumnDef<Patient>[] = [
  {
    id: "no",
    header: () => <div className="text-center font-medium">No</div>,
    cell: ({ row }) => (
      <div className="text-center text-muted-foreground">{row.index + 1}</div>
    ),
    size: 50,
  },
  // --- IDENTITAS (NAMA + NIK) ---
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent font-medium"
      >
        Pasien / NIK
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold uppercase leading-none mb-1">
          {row.original.name}
        </span>
        <span className="text-[11px] font-mono text-muted-foreground italic">
          {row.original.nik || "NIK Kosong"}
        </span>
      </div>
    ),
  },
  // --- USIA & JK (DIPADATKAN) ---
  {
    id: "age_gender",
    header: () => <div className="text-center font-medium">JK / Usia</div>,
    cell: ({ row }) => {
      const birthDate = new Date(row.original.birthDate);
      const gender = row.original.gender;
      return (
        <div className="flex items-center justify-center gap-2">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold",
              gender === "LAKI_LAKI"
                ? "bg-blue-100 text-blue-700"
                : "bg-pink-100 text-pink-700"
            )}
          >
            {gender === "LAKI_LAKI" ? "L" : "P"}
          </span>
          <span className="text-sm whitespace-nowrap">
            {getAgeDetails(birthDate)}
          </span>
        </div>
      );
    },
  },
  // --- ORANG TUA & KONTAK ---
  {
    accessorKey: "motherName",
    header: "Orang Tua / Wali",
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <span className="font-medium">{row.original.motherName}</span>
        {row.original.phoneNumber && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> {row.original.phoneNumber}
          </span>
        )}
      </div>
    ),
  },
  // --- DOMISILI (PENTING!) ---
  {
    id: "location",
    header: "Domisili",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs max-w-37.5">
        <span className="font-medium truncate uppercase">
          {row.original.villageName || "-"}
        </span>
        <span className="text-muted-foreground truncate italic flex items-center">
          <MapPin className="h-3 w-3 mr-0.5 shrink-0" />{" "}
          {row.original.districtName || "-"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center font-medium">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <CellActions id={row.original.id} />
      </div>
    ),
  },
];
