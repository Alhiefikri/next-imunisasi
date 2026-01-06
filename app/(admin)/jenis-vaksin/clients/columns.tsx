"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowUpDown,
  Syringe,
  FileText,
  Calendar,
  Clock,
  Hash,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Vaccine } from "@/lib/generated/prisma/client";
import CellActions from "./cell-actions";

export const columns: ColumnDef<Vaccine>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8"
      >
        Nama Vaksin
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Syringe className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-sm">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground">
            #{row.original.order}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="flex items-start gap-2 max-w-md">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p
            className={cn(
              "text-sm line-clamp-2",
              !description && "italic text-muted-foreground"
            )}
          >
            {description || "Tidak ada deskripsi"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "ageMonthMin",
    header: "Usia (Bulan)",
    cell: ({ row }) => {
      const min = row.original.ageMonthMin;
      const max = row.original.ageMonthMax;
      return (
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {min}
            {max ? ` - ${max}` : "+"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalDoses",
    header: "Dosis",
    cell: ({ row }) => {
      const doses = row.original.totalDoses;
      const interval = row.original.intervalDays;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{doses}x</span>
          </div>
          {interval && doses > 1 && (
            <span className="text-xs text-muted-foreground">
              Interval: {interval} hari
            </span>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <CellActions
          id={row.original.id}
          name={row.original.name}
          description={row.original.description ?? undefined}
          ageMonthMin={row.original.ageMonthMin}
          ageMonthMax={row.original.ageMonthMax ?? undefined}
          totalDoses={row.original.totalDoses}
          intervalDays={row.original.intervalDays ?? undefined}
          order={row.original.order}
          isActive={row.original.isActive}
        />
      </div>
    ),
  },
];
