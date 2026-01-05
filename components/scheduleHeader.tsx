"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Syringe,
  Calendar,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ScheduleHeaderProps {
  posyanduName: string;
  date: string;
  stats: {
    totalTarget: number;
    served: number;
    waiting: number;
    cancelled: number;
    totalVaccines: number;
  };
}

export function ScheduleHeader({
  posyanduName,
  date,
  stats,
}: ScheduleHeaderProps) {
  const scheduleDate = new Date(date);
  const progress =
    stats.totalTarget > 0
      ? Math.round((stats.served / stats.totalTarget) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">{posyanduName}</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p className="text-sm">
              {format(scheduleDate, "EEEE, dd MMMM yyyy", { locale: idLocale })}
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <Badge variant="outline" className="text-base px-4 py-2">
          Progress: {progress}%
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Target Pasien"
          value={stats.totalTarget}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Sudah Dilayani"
          value={stats.served}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Menunggu"
          value={stats.waiting}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          title="Batal"
          value={stats.cancelled}
          icon={<XCircle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Total Vaksin"
          value={stats.totalVaccines}
          icon={<Syringe className="h-5 w-5" />}
          color="purple"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "red" | "purple";
}

const colorConfig = {
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  green: "bg-emerald-50 text-emerald-600 border-emerald-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  red: "bg-rose-50 text-rose-600 border-rose-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
};

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg border", colorConfig[color])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
