// app/dashboard/_components/low-vaccination-alert.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

type Props = {
  patients: {
    id: string;
    name: string;
    ageMonths: number;
    givenCount: number;
    totalVaccines: number;
    coverage: number;
  }[];
};

export function LowVaccinationAlert({ patients }: Props) {
  if (patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Perhatian Khusus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Semua pasien memiliki coverage baik
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Perhatian Khusus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patients.map((patient) => (
          <Link
            key={patient.id}
            href={`/riwayat-imunisasi/${patient.id}`}
            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">{patient.name}</p>
                <p className="text-xs text-muted-foreground">
                  {patient.ageMonths} bulan
                </p>
                <p className="text-xs text-muted-foreground">
                  {patient.givenCount} / {patient.totalVaccines} vaksin
                </p>
              </div>
              <Badge
                variant={patient.coverage < 50 ? "destructive" : "secondary"}
              >
                {patient.coverage}%
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
