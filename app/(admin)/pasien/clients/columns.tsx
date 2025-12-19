"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Patient } from "@/lib/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import CellActions from "./cell-actions";
import { GENDER_LABEL } from "@/lib/constants";

type Patients = Patient;

export const columns: ColumnDef<Patients>[] = [
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="uppercase">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) => <div>{row.getValue("nik")}</div>,
  },
  {
    accessorKey: "birthDate",
    header: "Birth Date",
    cell: ({ row }) => (
      <div>{new Date(row.original.birthDate).toLocaleDateString("id-ID")}</div>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => <span>{GENDER_LABEL[row.original.gender]}</span>,
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <CellActions id={row.original.id} />;
    },
  },
];
