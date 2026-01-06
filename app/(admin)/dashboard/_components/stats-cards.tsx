// app/dashboard/_components/stats-cards.tsx
"use client";

import { DashboardStats } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Syringe, TrendingUp } from "lucide-react";

type Props = {
  stats: DashboardStats;
};

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      title: "Total Pasien",
      value: stats.patients.total,
      subtitle: `+${stats.patients.thisMonth} bulan ini`,
      growth: stats.patients.growth,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Jadwal Aktif",
      value: stats.schedules.upcoming + stats.schedules.ongoing,
      subtitle: `${stats.schedules.thisMonth} jadwal bulan ini`,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Vaksinasi",
      value: stats.vaccinations.total,
      subtitle: `+${stats.vaccinations.thisMonth} bulan ini`,
      icon: Syringe,
      color: "text-purple-600",
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendance.rate}%`,
      subtitle: `${stats.attendance.served} dari ${
        stats.attendance.served + stats.attendance.cancelled
      }`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            {"growth" in card && card.growth !== undefined && (
              <div
                className={`text-xs mt-1 ${
                  card.growth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {card.growth >= 0 ? "+" : ""}
                {card.growth}% vs bulan lalu
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
