"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";

interface ScheduleHeaderProps {
  posyanduName: string;
  date: Date;
  totalTarget: number;
  served: number;
  notServed: number;
  cancelled: number;
}

export function ScheduleHeader({
  posyanduName,
  date,
  totalTarget,
  served,
  notServed,
  cancelled,
}: ScheduleHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold">{posyanduName}</h1>
        <p className="text-sm text-muted-foreground">
          {date.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Estimasi Pasien"
          value={totalTarget}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Sudah Dilayani"
          value={served}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Belum Dilayani"
          value={notServed}
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title="Tidak Hadir / Ditunda"
          value={cancelled}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
