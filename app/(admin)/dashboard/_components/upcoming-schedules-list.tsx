// app/dashboard/_components/upcoming-schedules-list.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { UpcomingSchedule } from "@/app/actions/dashboard";

type Props = {
  schedules: UpcomingSchedule[];
};

export function UpcomingSchedulesList({ schedules }: Props) {
  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Mendatang</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Tidak ada jadwal mendatang
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jadwal Mendatang</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedules.map((schedule) => (
          <Link
            key={schedule.id}
            href={`/pelayanan/${schedule.id}`}
            className="block p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{schedule.posyanduName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(schedule.date), "EEEE, dd MMMM yyyy", {
                    locale: id,
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {schedule.servedCount} / {schedule.registeredCount} terlayani
                </div>
              </div>
              <Badge
                variant={
                  schedule.status === "ONGOING" ? "default" : "secondary"
                }
              >
                {schedule.status === "ONGOING" ? "Berlangsung" : "Akan Datang"}
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
