// app/dashboard/_components/recent-activities-timeline.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Syringe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { RecentActivity } from "@/app/actions/dashboard";

type Props = {
  activities: RecentActivity[];
};

export function RecentActivitiesTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Belum ada aktivitas
          </p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "PATIENT":
        return Users;
      case "SCHEDULE":
        return Calendar;
      case "VACCINATION":
        return Syringe;
      default:
        return Users;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "PATIENT":
        return "text-blue-600 bg-blue-100";
      case "SCHEDULE":
        return "text-green-600 bg-green-100";
      case "VACCINATION":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${getColor(
                    activity.type
                  )}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
