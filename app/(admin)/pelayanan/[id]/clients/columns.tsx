"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  Syringe,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

type PatientWithStatus = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  motherName: string | null;
  nik: string | null;
  status: "WAITING" | "SERVED" | "CANCELLED";
  recordId?: string;
  vaccineCount?: number;
};

const statusConfig = {
  WAITING: {
    label: "Menunggu",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-amber-600",
  },
  SERVED: {
    label: "Selesai",
    icon: CheckCircle2,
    variant: "default" as const,
    color: "text-emerald-600",
  },
  CANCELLED: {
    label: "Batal",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-rose-600",
  },
};

export const columns: ColumnDef<PatientWithStatus>[] = [
  {
    accessorKey: "name",
    header: "Nama Pasien",
    cell: ({ row }) => {
      const status = row.original.status;
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              status === "SERVED"
                ? "bg-emerald-50"
                : status === "CANCELLED"
                ? "bg-rose-50"
                : "bg-amber-50"
            )}
          >
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {row.getValue("name")}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.nik || "NIK belum tercatat"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "birthDate",
    header: "Tanggal Lahir",
    cell: ({ row }) => {
      const date = new Date(row.getValue("birthDate"));
      const age = Math.floor(
        (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      return (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{format(date, "dd MMM yyyy", { locale: idLocale })}</span>
            <span className="text-xs text-muted-foreground">{age} bulan</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "JK",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.getValue("gender") === "LAKI_LAKI" ? "L" : "P"}
      </span>
    ),
  },
  {
    accessorKey: "motherName",
    header: "Nama Ibu",
    cell: ({ row }) => {
      const motherName = row.getValue("motherName") as string | null;
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{motherName || "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "vaccineCount",
    header: "Vaksin",
    cell: ({ row }) => {
      const count = row.original.vaccineCount ?? 0;
      return (
        <div className="flex items-center gap-2">
          <Syringe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {count > 0 ? `${count}x` : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusConfig;
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <Badge variant={config.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
];
