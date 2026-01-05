"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CalendarDays, MapPin, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

import { JadwalProps } from "@/hooks/use-jadwal"; // Pastikan interface ini mencakup relasi posyandu

import { cn } from "@/lib/utils";
import CellActions from "./cell-actions";

export const columns: ColumnDef<JadwalProps>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8 font-bold text-primary"
      >
        Tanggal Pelaksanaan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold uppercase tracking-tight text-slate-900 leading-none mb-1">
              {format(new Date(date), "EEEE, dd MMM yyyy", {
                locale: localeID,
              })}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono italic">
              Status: {row.original.status}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "location",
    header: "Lokasi Posyandu",
    cell: ({ row }) => {
      // Mengambil data dari relasi posyandu
      const posyanduName = row.original.posyandu?.name || "Posyandu dihapus";
      const village = row.original.posyandu?.villageName || "-";
      return (
        <div className="flex flex-col gap-1 min-w-37.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 uppercase">
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            {posyanduName}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
            <span className="font-medium text-emerald-600">
              Kelurahan {village}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={cn(
            "font-bold uppercase text-[10px] px-2 py-0.5",
            status === "UPCOMING" &&
              "bg-amber-100 text-amber-700 hover:bg-amber-100",
            status === "ONGOING" &&
              "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 animate-pulse",
            status === "COMPLETED" &&
              "bg-blue-100 text-blue-700 hover:bg-blue-100",
            status === "CANCELLED" &&
              "bg-rose-100 text-rose-700 hover:bg-rose-100"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Catatan",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string;
      return (
        <div className="flex items-start gap-1.5 max-w-50">
          <Info className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed truncate italic">
            {notes || "Tidak ada catatan"}
          </p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center font-medium">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <CellActions data={row.original} />
      </div>
    ),
    enableHiding: false,
  },
];
