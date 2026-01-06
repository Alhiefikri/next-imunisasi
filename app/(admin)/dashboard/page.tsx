// app/dashboard/page.tsx
import { Suspense } from "react";

import {
  getDashboardStats,
  getLowVaccinationPatients,
  getRecentActivities,
  getUpcomingSchedules,
  getVaccinationTrend,
} from "@/app/actions/dashboard";
import { CardSkeleton } from "./_components/skeletons";
import { StatsCards } from "./_components/stats-cards";
import { TopVaccinesChart } from "./_components/top-vaccines-chart";
import { VaccinationTrendChart } from "./_components/vaccination-trend-chart";
import { UpcomingSchedulesList } from "./_components/upcoming-schedules-list";
import { RecentActivitiesTimeline } from "./_components/recent-activities-timeline";
import { LowVaccinationAlert } from "./_components/low-vaccination-alert";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview sistem imunisasi posyandu
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCardsSection />
      </Suspense>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <TopVaccinesSection />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <VaccinationTrendSection />
        </Suspense>
      </div>

      {/* Content Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Suspense fallback={<CardSkeleton />}>
            <UpcomingSchedulesSection />
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
            <RecentActivitiesSection />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<CardSkeleton />}>
            <LowVaccinationSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function StatsCardsSection() {
  const stats = await getDashboardStats();
  return <StatsCards stats={stats} />;
}

async function TopVaccinesSection() {
  const stats = await getDashboardStats();
  return <TopVaccinesChart data={stats.vaccinations.byVaccine} />;
}

async function VaccinationTrendSection() {
  const trend = await getVaccinationTrend(6);
  return <VaccinationTrendChart data={trend} />;
}

async function UpcomingSchedulesSection() {
  const schedules = await getUpcomingSchedules(5);
  return <UpcomingSchedulesList schedules={schedules} />;
}

async function RecentActivitiesSection() {
  const activities = await getRecentActivities(10);
  return <RecentActivitiesTimeline activities={activities} />;
}

async function LowVaccinationSection() {
  const patients = await getLowVaccinationPatients(10);
  return <LowVaccinationAlert patients={patients} />;
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
