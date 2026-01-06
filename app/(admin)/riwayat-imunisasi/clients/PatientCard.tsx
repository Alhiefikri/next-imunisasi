// app/riwayat-imunisasi/components/patient-card.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Baby,
  User,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trophy,
  MessageSquare,
} from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type PatientWithStatus = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  motherName: string | null;
  nik: string | null;
  age: {
    months: number;
    display: string;
  };
  vaccination: {
    given: number;
    total: number;
    progress: number;
    status: "on-track" | "warning" | "behind" | "completed";
  };
  lastVisit: string | null;
  lastVisitStatus: "SERVED" | "CANCELLED" | "WAITING";
  lastVisitNotes?: string | null;
};

interface PatientCardProps {
  patient: PatientWithStatus;
}

const statusConfig = {
  "on-track": {
    label: "Sesuai Jadwal",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  warning: {
    label: "Perlu Perhatian",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  behind: {
    label: "Terlambat",
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  completed: {
    label: "Selesai",
    icon: Trophy,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
};

export default function PatientCard({ patient }: PatientCardProps) {
  const config = statusConfig[patient.vaccination.status];
  const StatusIcon = config.icon;

  const progressColor = cn(
    patient.vaccination.status === "behind" && "[&>div]:bg-rose-500",
    patient.vaccination.status === "warning" && "[&>div]:bg-amber-500",
    patient.vaccination.status === "on-track" && "[&>div]:bg-emerald-500",
    patient.vaccination.status === "completed" && "[&>div]:bg-blue-500"
  );

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
      <CardContent className="p-6 space-y-4">
        {/* Header - Avatar & Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center shrink-0",
              patient.gender === "LAKI_LAKI"
                ? "bg-blue-100 text-blue-600"
                : "bg-pink-100 text-pink-600"
            )}
          >
            <Baby className="h-7 w-7" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{patient.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {patient.gender === "LAKI_LAKI" ? "L" : "P"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {patient.age.display}
              </span>
            </div>
          </div>
        </div>

        {/* Parent Info */}
        {patient.motherName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">Ibu: {patient.motherName}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress Vaksinasi</span>
            <span className="text-muted-foreground">
              {patient.vaccination.given}/{patient.vaccination.total}
            </span>
          </div>
          <Progress value={patient.vaccination.progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {patient.vaccination.progress}% selesai
          </p>
        </div>

        {/* INFO KETERANGAN / ALASAN (Hanya muncul jika ada catatan atau status batal) */}
        {(patient.lastVisitStatus === "CANCELLED" ||
          patient.lastVisitNotes) && (
          <div
            className={cn(
              "rounded-md p-3 text-xs flex gap-2 items-start animate-in fade-in slide-in-from-top-1",
              patient.lastVisitStatus === "CANCELLED"
                ? "bg-rose-50 border border-rose-100"
                : "bg-slate-50 border border-slate-100"
            )}
          >
            <MessageSquare
              className={cn(
                "h-3.5 w-3.5 mt-0.5 shrink-0",
                patient.lastVisitStatus === "CANCELLED"
                  ? "text-rose-500"
                  : "text-slate-500"
              )}
            />
            <div className="space-y-1">
              <p className="font-bold uppercase text-[10px] tracking-tight text-muted-foreground">
                Keterangan Terakhir:
              </p>
              <p
                className={cn(
                  "leading-relaxed italic",
                  patient.lastVisitStatus === "CANCELLED"
                    ? "text-rose-700"
                    : "text-slate-700"
                )}
              >
                {patient.lastVisitNotes || "Tidak ada keterangan spesifik"}
              </p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={cn(
            "flex items-center justify-center gap-2 py-2 px-4 rounded-lg border",
            config.bg,
            config.border
          )}
        >
          <StatusIcon className={cn("h-4 w-4", config.color)} />
          <span className={cn("text-sm font-semibold", config.color)}>
            {config.label}
          </span>
        </div>

        {/* Last Visit */}
        {patient.lastVisit && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>
              Kunjungan terakhir:{" "}
              {format(new Date(patient.lastVisit), "dd MMM yyyy", {
                locale: idLocale,
              })}
            </span>
          </div>
        )}
      </CardContent>

      {/* Footer - Action Button */}
      <CardFooter className="p-4 pt-0">
        <Link href={`/riwayat-imunisasi/${patient.id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            Lihat Riwayat Lengkap
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
