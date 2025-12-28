"use server";

import { JadwalProps } from "@/hooks/use-jadwal";
import { requireAdmin } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// Menyesuaikan dengan gaya template kamu
export const getJadwalData = async () => {
  try {
    const session = await requireAdmin();
    if (!session) throw new Error("Unauthorized");

    const res = await prisma.schedule.findMany({
      include: {
        posyandu: true, // Agar bisa ambil nama Posyandu untuk tabel
      },
      orderBy: { date: "asc" },
    });

    return res;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw new Error("Failed to fetch schedules");
  }
};

export const createJadwal = async (
  posyanduId: string,
  date: Date,
  notes?: string
) => {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: "Unauthorized" };

    // Validasi double booking (opsional tapi disarankan)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.schedule.findFirst({
      where: {
        posyanduId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing)
      return {
        success: false,
        error: "Jadwal di lokasi ini sudah ada pada tanggal tersebut",
      };

    const res = await prisma.schedule.create({
      data: {
        posyanduId,
        date,
        notes,
        status: "UPCOMING",
      },
    });

    revalidatePath("/dashboard/jadwal");
    return { success: true, data: res };
  } catch (error) {
    console.error("Error creating schedule:", error);
    return { success: false, error: "Failed to create schedule" };
  }
};

export const updateJadwal = async (jadwal: JadwalProps) => {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: "Unauthorized" };

    const res = await prisma.schedule.update({
      where: { id: jadwal.id },
      data: {
        posyanduId: jadwal.posyanduId,
        date: jadwal.date,
        notes: jadwal.notes,
      },
    });

    revalidatePath("jadwal-imunisasi");
    return { success: true, data: res };
  } catch (error) {
    console.error("Error updating schedule:", error);
    return { success: false, error: "Failed to update schedule" };
  }
};

export const removeJadwal = async (id: string) => {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: "Unauthorized" };

    await prisma.schedule.delete({
      where: { id },
    });

    revalidatePath("/dashboard/jadwal");
    return { success: true };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return {
      success: false,
      error: "Pastikan tidak ada rekam medis terkait sebelum menghapus",
    };
  }
};
