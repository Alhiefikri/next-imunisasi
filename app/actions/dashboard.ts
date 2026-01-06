// app/dashboard/actions.ts
"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

// ==================== TYPES ====================

export type DashboardStats = {
  patients: {
    total: number;
    thisMonth: number;
    growth: number; // percentage
  };
  schedules: {
    upcoming: number;
    ongoing: number;
    completed: number;
    thisMonth: number;
  };
  vaccinations: {
    total: number;
    thisMonth: number;
    byVaccine: {
      vaccineId: string;
      vaccineName: string;
      count: number;
    }[];
  };
  attendance: {
    served: number;
    cancelled: number;
    waiting: number;
    rate: number; // served / (served + cancelled) * 100
  };
};

export type RecentActivity = {
  id: string;
  type: "PATIENT" | "SCHEDULE" | "VACCINATION";
  title: string;
  description: string;
  timestamp: string;
  meta?: {
    patientName?: string;
    posyanduName?: string;
    vaccineNames?: string[];
  };
};

export type VaccinationTrend = {
  month: string; // "2024-01"
  total: number;
  byVaccine: {
    vaccineId: string;
    vaccineName: string;
    count: number;
  }[];
};

export type UpcomingSchedule = {
  id: string;
  date: string;
  posyanduName: string;
  registeredCount: number;
  servedCount: number;
  status: string;
};

// ==================== QUERIES ====================

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const now = new Date();
  const startThisMonth = startOfMonth(now);
  const endThisMonth = endOfMonth(now);
  const startLastMonth = startOfMonth(subMonths(now, 1));
  const endLastMonth = endOfMonth(subMonths(now, 1));

  // 1. PATIENTS STATS
  const [totalPatients, patientsThisMonth, patientsLastMonth] =
    await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.patient.count({
        where: {
          isActive: true,
          createdAt: { gte: startThisMonth, lte: endThisMonth },
        },
      }),
      prisma.patient.count({
        where: {
          isActive: true,
          createdAt: { gte: startLastMonth, lte: endLastMonth },
        },
      }),
    ]);

  const patientGrowth =
    patientsLastMonth === 0
      ? 100
      : Math.round(
          ((patientsThisMonth - patientsLastMonth) / patientsLastMonth) * 100
        );

  // 2. SCHEDULES STATS
  const [upcoming, ongoing, completed, schedulesThisMonth] = await Promise.all([
    prisma.schedule.count({ where: { status: "UPCOMING" } }),
    prisma.schedule.count({ where: { status: "ONGOING" } }),
    prisma.schedule.count({ where: { status: "COMPLETED" } }),
    prisma.schedule.count({
      where: {
        date: { gte: startThisMonth, lte: endThisMonth },
      },
    }),
  ]);

  // 3. VACCINATIONS STATS
  const [totalVaccinations, vaccinationsThisMonth, vaccinationsByVaccine] =
    await Promise.all([
      prisma.vaccineHistory.count(),
      prisma.vaccineHistory.count({
        where: {
          givenAt: { gte: startThisMonth, lte: endThisMonth },
        },
      }),
      prisma.vaccineHistory.groupBy({
        by: ["vaccineId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);

  // Get vaccine names
  const vaccineIds = vaccinationsByVaccine.map((v) => v.vaccineId);
  const vaccines = await prisma.vaccine.findMany({
    where: { id: { in: vaccineIds } },
    select: { id: true, name: true },
  });

  const vaccineMap = new Map(vaccines.map((v) => [v.id, v.name]));

  const byVaccine = vaccinationsByVaccine.map((v) => ({
    vaccineId: v.vaccineId,
    vaccineName: vaccineMap.get(v.vaccineId) || "Unknown",
    count: v._count.id,
  }));

  // 4. ATTENDANCE STATS
  const [served, cancelled, waiting] = await Promise.all([
    prisma.immunizationRecord.count({ where: { status: "SERVED" } }),
    prisma.immunizationRecord.count({ where: { status: "CANCELLED" } }),
    prisma.immunizationRecord.count({ where: { status: "WAITING" } }),
  ]);

  const attendanceRate =
    served + cancelled === 0
      ? 0
      : Math.round((served / (served + cancelled)) * 100);

  return {
    patients: {
      total: totalPatients,
      thisMonth: patientsThisMonth,
      growth: patientGrowth,
    },
    schedules: {
      upcoming,
      ongoing,
      completed,
      thisMonth: schedulesThisMonth,
    },
    vaccinations: {
      total: totalVaccinations,
      thisMonth: vaccinationsThisMonth,
      byVaccine,
    },
    attendance: {
      served,
      cancelled,
      waiting,
      rate: attendanceRate,
    },
  };
}

export async function getRecentActivities(
  limit: number = 10
): Promise<RecentActivity[]> {
  await requireAdmin();

  // Get recent patients (last 7 days)
  const recentPatients = await prisma.patient.findMany({
    where: {
      isActive: true,
      createdAt: { gte: subMonths(new Date(), 1) },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });

  // Get recent schedules
  const recentSchedules = await prisma.schedule.findMany({
    where: {
      createdAt: { gte: subMonths(new Date(), 1) },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      posyandu: { select: { name: true } },
    },
  });

  // Get recent vaccinations
  const recentVaccinations = await prisma.vaccineHistory.findMany({
    where: {
      givenAt: { gte: subMonths(new Date(), 1) },
    },
    orderBy: { givenAt: "desc" },
    take: limit,
    include: {
      patient: { select: { name: true } },
      vaccine: { select: { name: true } },
      schedule: {
        include: { posyandu: { select: { name: true } } },
      },
    },
  });

  // Merge and sort
  const activities: RecentActivity[] = [
    ...recentPatients.map((p) => ({
      id: p.id,
      type: "PATIENT" as const,
      title: "Pasien Baru Terdaftar",
      description: p.name,
      timestamp: p.createdAt.toISOString(),
      meta: { patientName: p.name },
    })),
    ...recentSchedules.map((s) => ({
      id: s.id,
      type: "SCHEDULE" as const,
      title: "Jadwal Baru Dibuat",
      description: s.posyandu.name,
      timestamp: s.createdAt.toISOString(),
      meta: { posyanduName: s.posyandu.name },
    })),
    ...recentVaccinations.map((v) => ({
      id: v.id,
      type: "VACCINATION" as const,
      title: "Vaksinasi Diberikan",
      description: `${v.patient.name} - ${v.vaccine.name}`,
      timestamp: v.givenAt.toISOString(),
      meta: {
        patientName: v.patient.name,
        posyanduName: v.schedule.posyandu.name,
        vaccineNames: [v.vaccine.name],
      },
    })),
  ];

  return activities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
}

export async function getVaccinationTrend(
  months: number = 6
): Promise<VaccinationTrend[]> {
  await requireAdmin();

  const trends: VaccinationTrend[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    const vaccinations = await prisma.vaccineHistory.groupBy({
      by: ["vaccineId"],
      where: {
        givenAt: { gte: start, lte: end },
      },
      _count: { id: true },
    });

    const total = vaccinations.reduce((sum, v) => sum + v._count.id, 0);

    // Get vaccine names
    const vaccineIds = vaccinations.map((v) => v.vaccineId);
    const vaccines = await prisma.vaccine.findMany({
      where: { id: { in: vaccineIds } },
      select: { id: true, name: true },
    });

    const vaccineMap = new Map(vaccines.map((v) => [v.id, v.name]));

    trends.push({
      month: `${monthDate.getFullYear()}-${String(
        monthDate.getMonth() + 1
      ).padStart(2, "0")}`,
      total,
      byVaccine: vaccinations.map((v) => ({
        vaccineId: v.vaccineId,
        vaccineName: vaccineMap.get(v.vaccineId) || "Unknown",
        count: v._count.id,
      })),
    });
  }

  return trends;
}

export async function getUpcomingSchedules(
  limit: number = 5
): Promise<UpcomingSchedule[]> {
  await requireAdmin();

  const schedules = await prisma.schedule.findMany({
    where: {
      status: { in: ["UPCOMING", "ONGOING"] },
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    take: limit,
    include: {
      posyandu: { select: { name: true } },
      _count: {
        select: {
          immunizationRecords: true,
        },
      },
      immunizationRecords: {
        where: { status: "SERVED" },
        select: { id: true },
      },
    },
  });

  return schedules.map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    posyanduName: s.posyandu.name,
    registeredCount: s._count.immunizationRecords,
    servedCount: s.immunizationRecords.length,
    status: s.status,
  }));
}

export async function getLowVaccinationPatients(limit: number = 10) {
  await requireAdmin();

  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    include: {
      vaccineHistories: {
        select: { vaccineId: true },
      },
    },
    take: 100, // Ambil lebih banyak untuk filter
  });

  const totalVaccines = await prisma.vaccine.count({
    where: { isActive: true },
  });

  // Calculate coverage and filter
  const patientsWithCoverage = patients
    .map((p) => {
      const givenCount = new Set(p.vaccineHistories.map((vh) => vh.vaccineId))
        .size;
      const coverage = Math.round((givenCount / totalVaccines) * 100);

      const birthDate = new Date(p.birthDate);
      const ageMonths = Math.floor(
        (new Date().getTime() - birthDate.getTime()) /
          (1000 * 60 * 60 * 24 * 30.44)
      );

      return {
        id: p.id,
        name: p.name,
        ageMonths,
        givenCount,
        totalVaccines,
        coverage,
      };
    })
    .filter((p) => p.coverage < 80) // Only show < 80%
    .sort((a, b) => a.coverage - b.coverage)
    .slice(0, limit);

  return patientsWithCoverage;
}
