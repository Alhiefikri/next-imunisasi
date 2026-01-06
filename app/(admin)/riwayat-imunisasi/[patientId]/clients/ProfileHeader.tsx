"use client";

import {
  Baby,
  Calendar,
  User,
  MapPin,
  BadgeCheck,
  Printer,
  Edit3,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getAgeDetails } from "@/lib/utils";
import { Patient } from "@/lib/generated/prisma/client";

interface ProfileHeaderProps {
  patient: Patient; // Gunakan tipe data yang sesuai dengan return dari server action
}

export default function ProfileHeader({ patient }: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-slate-50">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Sisi Kiri: Avatar & Info Utama */}
          <div className="p-6 flex flex-col items-center md:items-start md:flex-row gap-6 flex-1">
            <div
              className={cn(
                "h-24 w-24 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                patient.gender === "LAKI_LAKI"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-pink-100 text-pink-600"
              )}
            >
              <Baby className="h-12 w-12" />
            </div>

            <div className="space-y-3 text-center md:text-left flex-1">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {patient.name}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-white/50 backdrop-blur-sm"
                  >
                    {patient.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                  </Badge>
                </div>
                <p className="text-sm font-mono text-muted-foreground tracking-widest">
                  NIK: {patient.nik || "Belum Terdaftar"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{getAgeDetails(patient.birthDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="h-4 w-4 text-primary" />
                  <span>Ibu: {patient.motherName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>
                    Wilayah:{" "}
                    {patient.villageName ||
                      patient.districtName ||
                      "Luar Wilayah"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-emerald-700">
                    Status Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Quick Actions */}
          <div className="bg-slate-100/50 p-6 flex flex-row md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 min-w-[200px]">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-white"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Cetak Riwayat
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-white text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-100"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
