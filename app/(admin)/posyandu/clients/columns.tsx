"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MapPin, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Posyandu } from "@/lib/generated/prisma/client";
import CellActions from "./cell-actions";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<Posyandu>[] = [
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
        Nama Posyandu
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold uppercase tracking-tight text-slate-900 leading-none mb-1">
              {row.getValue("name")}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono italic">
              ID: {row.original.id.slice(0, 8)}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "region",
    header: "Wilayah Kerja",
    cell: ({ row }) => {
      const village = row.original.villageName || "Tidak Set";
      const district = row.original.districtName || "Tidak Set";
      return (
        <div className="flex flex-col gap-1 min-w-37.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 uppercase">
            <Home className="h-3.5 w-3.5 text-emerald-500" />
            {village}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
            <MapPin className="h-3 w-3" />
            {district}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Alamat Lengkap",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return (
        <div className="py-1">
          <p
            className={cn(
              "text-sm leading-relaxed wrap-break-word min-w-50 max-w-87.5",
              !address ? "italic text-muted-foreground" : "text-slate-600"
            )}
          >
            {address || "Alamat belum diinput"}
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
        <CellActions
          id={row.original.id}
          name={row.original.name}
          address={row.original.address}
          districtId={row.original.districtId!}
          districtName={row.original.districtName!}
          villageId={row.original.villageId!}
          villageName={row.original.villageName!}
        />
      </div>
    ),
    enableHiding: false,
  },
];
