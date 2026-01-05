"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { ScheduleFormSchema } from "@/lib/zod";
import type { Schedule } from "@/lib/generated/prisma/client";

// ==================== QUERIES ====================

export async function getSchedules(): Promise<Schedule[]> {
  await requireAdmin();

  return await prisma.schedule.findMany({
    orderBy: { date: "desc" },
    include: {
      posyandu: true,
      _count: {
        select: {
          immunizationRecords: true,
          vaccineHistories: true,
        },
      },
    },
  });
}

export async function getSchedule(id: string): Promise<Schedule | null> {
  await requireAdmin();

  return await prisma.schedule.findUnique({
    where: { id },
    include: {
      posyandu: true,
      immunizationRecords: {
        include: {
          patient: true,
        },
        orderBy: { createdAt: "desc" },
      },
      vaccineHistories: {
        include: {
          vaccine: true,
          patient: true,
        },
      },
    },
  });
}

export async function getUpcomingSchedules() {
  await requireAdmin();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.schedule.findMany({
    where: {
      date: { gte: today },
      status: { in: ["UPCOMING", "ONGOING"] },
    },
    orderBy: { date: "asc" },
    include: {
      posyandu: true,
      _count: {
        select: { immunizationRecords: true },
      },
    },
    take: 10,
  });
}

// ==================== MUTATIONS ====================

export async function createSchedule(input: unknown) {
  await requireAdmin();
  const data = ScheduleFormSchema.parse(input);

  // Check conflict: same posyandu on same date
  const start = new Date(data.date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(data.date);
  end.setHours(23, 59, 59, 999);

  const conflict = await prisma.schedule.findFirst({
    where: {
      posyanduId: data.posyanduId,
      date: { gte: start, lte: end },
    },
  });

  if (conflict) {
    throw new Error("Posyandu sudah memiliki jadwal di tanggal ini");
  }

  const schedule = await prisma.schedule.create({
    data: {
      posyanduId: data.posyanduId,
      date: data.date,
      notes: data.notes,
      status: "UPCOMING",
    },
  });

  revalidatePath("/dashboard/jadwal");
  return schedule;
}

export async function updateSchedule(id: string, input: unknown) {
  await requireAdmin();
  const data = ScheduleFormSchema.parse(input);

  // Check if schedule is already COMPLETED
  const existing = await prisma.schedule.findUnique({
    where: { id },
    select: { status: true },
  });

  if (existing?.status === "COMPLETED") {
    throw new Error("Jadwal yang sudah selesai tidak dapat diubah");
  }

  // Check conflict (exclude current schedule)
  const start = new Date(data.date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(data.date);
  end.setHours(23, 59, 59, 999);

  const conflict = await prisma.schedule.findFirst({
    where: {
      posyanduId: data.posyanduId,
      date: { gte: start, lte: end },
      id: { not: id },
    },
  });

  if (conflict) {
    throw new Error("Posyandu sudah memiliki jadwal di tanggal ini");
  }

  const schedule = await prisma.schedule.update({
    where: { id },
    data: {
      posyanduId: data.posyanduId,
      date: data.date,
      notes: data.notes,
    },
  });

  revalidatePath("/dashboard/jadwal");
  revalidatePath(`/dashboard/jadwal/${id}`);
  return schedule;
}

export async function deleteSchedule(id: string) {
  await requireAdmin();

  // Check if schedule has records
  const hasRecords = await prisma.ImmunizationRecords.count({
    where: { scheduleId: id },
  });

  if (hasRecords > 0) {
    throw new Error(
      "Tidak dapat menghapus jadwal yang sudah memiliki data pelayanan"
    );
  }

  // Check if status is COMPLETED
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    select: { status: true },
  });

  if (schedule?.status === "COMPLETED") {
    throw new Error("Jadwal yang sudah selesai tidak dapat dihapus");
  }

  await prisma.schedule.delete({
    where: { id },
  });

  revalidatePath("/dashboard/jadwal");
}

export async function updateScheduleStatus(
  id: string,
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED"
) {
  await requireAdmin();

  // Auto-lock vaccine histories when status becomes COMPLETED
  if (status === "COMPLETED") {
    await prisma.vaccineHistory.updateMany({
      where: { scheduleId: id },
      data: { isLocked: true },
    });
  }

  const schedule = await prisma.schedule.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard/jadwal");
  revalidatePath(`/dashboard/jadwal/${id}`);
  return schedule;
}

export async function searchSchedules(query: string) {
  await requireAdmin();

  return await prisma.schedule.findMany({
    where: {
      OR: [
        { notes: { contains: query, mode: "insensitive" } },
        { posyandu: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      posyandu: true,
    },
    take: 10,
  });
}
