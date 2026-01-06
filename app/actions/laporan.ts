"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";

export async function getMonthlyReport(
  month: number,
  year: number,
  villageId?: string
) {
  await requireAdmin();

  // Range tanggal awal dan akhir bulan
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // 1. Ambil semua riwayat vaksin di periode tersebut
  const histories = await prisma.vaccineHistory.findMany({
    where: {
      givenAt: { gte: startDate, lte: endDate },
      patient: villageId ? { villageId } : {}, // Filter kelurahan jika ada
    },
    include: {
      vaccine: true,
      patient: true,
    },
  });

  // 2. Ambil ringkasan kunjungan (Served vs Cancelled)
  const records = await prisma.immunizationRecord.groupBy({
    by: ["status"],
    where: {
      schedule: {
        date: { gte: startDate, lte: endDate },
      },
      patient: villageId ? { villageId } : {},
    },
    _count: true,
  });

  // 3. Kelompokkan jumlah per jenis vaksin (Rekapitulasi)
  const vaksins = await prisma.vaccine.findMany({ where: { isActive: true } });
  const rekapVaksin = vaksins.map((v) => {
    const count = histories.filter((h) => h.vaccineId === v.id).length;
    return {
      name: v.name,
      total: count,
    };
  });

  return {
    detail: histories, // Untuk list nama anak
    rekap: rekapVaksin, // Untuk tabel ringkasan
    stats: {
      hadir: records.find((r) => r.status === "SERVED")?._count || 0,
      batal: records.find((r) => r.status === "CANCELLED")?._count || 0,
    },
  };
}
