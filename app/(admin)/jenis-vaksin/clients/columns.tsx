"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Syringe, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Vaccine } from "@/lib/generated/prisma/client";
import CellActions from "./cell-actions";
import { cn } from "@/lib/utils";

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
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8 data-[state=open]:bg-accent font-bold text-primary"
      >
        Nama Vaksin
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Syringe className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold uppercase tracking-tight text-slate-900 leading-none mb-1">
              {row.getValue("name")}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono italic">
              ID: {row.original.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Deskripsi / Catatan",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        /* PERBAIKAN DISINI: 
           - min-w: Menjaga lebar minimum kolom
           - max-w: Batas maksimal teks sebelum turun ke bawah (wrapping)
           - break-words: Memastikan kata panjang tidak 'bocor' keluar kolom
        */
        <div className="flex items-start gap-2 py-1">
          <FileText className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
          <div
            className={cn(
              "text-sm leading-relaxed wrap-break-word min-w-50 max-w-100",
              !description ? "italic text-muted-foreground" : "text-slate-600"
            )}
          >
            {description || "Tidak ada deskripsi tambahan"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ditambahkan Pada",
    cell: ({ row }) => {
      return (
        <div className="flex items-center text-muted-foreground text-sm whitespace-nowrap">
          <Calendar className="mr-2 h-4 w-4 shrink-0" />
          {format(new Date(row.original.createdAt), "dd MMM yyyy", {
            locale: id,
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <CellActions
            name={row.original.name}
            id={row.original.id}
            description={row.original.description || ""}
          />
        </div>
      );
    },
  },
];
