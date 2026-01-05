"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { VaccineFormSchema } from "@/lib/zod";
import { Prisma, type Vaccine } from "@/lib/generated/prisma/client";

// ==================== QUERIES ====================

export async function getVaccines(): Promise<Vaccine[]> {
  await requireAdmin();

  return await prisma.vaccine.findMany({
    orderBy: { order: "asc" }, // ✅ Sort by order, bukan createdAt
    where: { isActive: true }, // ✅ Only active vaccines
    include: {
      _count: {
        select: { vaccineHistories: true },
      },
    },
  });
}

export async function getVaccine(id: string): Promise<Vaccine | null> {
  await requireAdmin();

  return await prisma.vaccine.findUnique({
    where: { id },
    include: {
      vaccineHistories: {
        take: 10,
        orderBy: { givenAt: "desc" },
      },
    },
  });
}

// ==================== MUTATIONS ====================

export async function createVaccine(input: unknown) {
  await requireAdmin();
  const data = VaccineFormSchema.parse(input);

  try {
    const vaccine = await prisma.vaccine.create({
      data,
    });

    revalidatePath("/dashboard/vaksin");
    return vaccine;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Nama vaksin sudah terdaftar");
    }
    throw new Error("Gagal membuat vaksin");
  }
}

export async function updateVaccine(id: string, input: unknown) {
  await requireAdmin();
  const data = VaccineFormSchema.parse(input);

  try {
    const vaccine = await prisma.vaccine.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/vaksin");
    revalidatePath(`/dashboard/vaksin/${id}`);
    return vaccine;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Nama vaksin sudah digunakan");
    }
    throw new Error("Gagal memperbarui vaksin");
  }
}

export async function deleteVaccine(id: string) {
  await requireAdmin();

  // ✅ Check if vaccine has history
  const hasHistory = await prisma.vaccineHistory.count({
    where: { vaccineId: id },
  });

  if (hasHistory > 0) {
    throw new Error("Vaksin tidak dapat dihapus karena sudah digunakan");
  }

  await prisma.vaccine.delete({
    where: { id },
  });

  revalidatePath("/dashboard/vaksin");
}

export async function toggleVaccineStatus(id: string) {
  await requireAdmin();

  const vaccine = await prisma.vaccine.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!vaccine) {
    throw new Error("Vaksin tidak ditemukan");
  }

  const updated = await prisma.vaccine.update({
    where: { id },
    data: { isActive: !vaccine.isActive },
  });

  revalidatePath("/dashboard/vaksin");
  return updated;
}

export async function searchVaccines(query: string) {
  await requireAdmin();

  return await prisma.vaccine.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });
}
