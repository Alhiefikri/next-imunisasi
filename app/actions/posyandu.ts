"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { PosyanduFormSchema } from "@/lib/zod";
import type { Posyandu } from "@/lib/generated/prisma/client";

// ==================== QUERIES ====================

export async function getPosyandus() {
  await requireAdmin();

  return await prisma.posyandu.findMany({
    orderBy: { name: "asc" }, // Biasanya urutan abjad lebih enak untuk list posyandu
    include: {
      _count: {
        select: { schedules: true },
      },
    },
  });
}

export async function getPosyandu(id: string): Promise<Posyandu | null> {
  await requireAdmin();

  return await prisma.posyandu.findUnique({
    where: { id },
    include: {
      schedules: {
        orderBy: { date: "desc" },
        take: 5,
      },
    },
  });
}

// ==================== MUTATIONS ====================

export async function createPosyandu(input: unknown) {
  await requireAdmin();
  const data = PosyanduFormSchema.parse(input);

  // Check unik (Opsional tapi disarankan)
  const existing = await prisma.posyandu.findFirst({
    where: {
      name: { equals: data.name, mode: "insensitive" },
      villageId: data.villageId,
    },
  });

  if (existing)
    throw new Error("Posyandu dengan nama tersebut sudah ada di desa ini");

  const posyandu = await prisma.posyandu.create({ data });

  revalidatePath("/dashboard/posyandu");
  return posyandu;
}

export async function updatePosyandu(id: string, input: unknown) {
  await requireAdmin();
  const data = PosyanduFormSchema.parse(input);

  const posyandu = await prisma.posyandu.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/posyandu");
  revalidatePath(`/dashboard/posyandu/${id}`);
  return posyandu;
}

export async function deletePosyandu(id: string) {
  await requireAdmin();

  // 1. Cek relasi ke Jadwal (Schedules)
  const hasSchedules = await prisma.schedule.count({
    where: { posyanduId: id },
  });

  if (hasSchedules > 0) {
    throw new Error(
      "Posyandu tidak bisa dihapus karena sudah memiliki riwayat jadwal."
    );
  }

  // 2. Cek relasi ke Pasien (jika di schema kamu Patient ikat ke Posyandu)
  // const hasPatients = await prisma.patient.count({ where: { posyanduId: id } });

  try {
    await prisma.posyandu.delete({ where: { id } });
    revalidatePath("/dashboard/posyandu");
    return { success: true };
  } catch (error) {
    throw new Error("Gagal menghapus data");
  }
}

export async function searchPosyandus(query: string) {
  await requireAdmin();

  return await prisma.posyandu.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
        { districtName: { contains: query, mode: "insensitive" } },
        { villageName: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });
}
