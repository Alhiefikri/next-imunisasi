// app/riwayat-imunisasi/actions.ts
"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";

type PatientWithStatus = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  motherName: string | null;
  nik: string | null;
  age: {
    months: number;
    display: string;
  };
  vaccination: {
    given: number;
    total: number;
    progress: number;
    status: "on-track" | "warning" | "behind" | "completed";
  };
  lastVisit: string | null;
  lastVisitStatus: "SERVED" | "CANCELLED" | "WAITING";
  lastVisitNotes?: string | null;
};

export async function getPatientsWithVaccinationStatus(): Promise<
  PatientWithStatus[]
> {
  await requireAdmin();

  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    include: {
      vaccineHistories: true,
      // 1. Tambahkan include untuk records guna mendapatkan status kunjungan
      immunizationRecords: {
        orderBy: {
          schedule: { date: "desc" },
        },
        take: 1, // Kita cuma butuh kunjungan paling terakhir
        include: {
          schedule: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalVaccines = await prisma.vaccine.count({
    where: { isActive: true },
  });

  return patients.map((patient) => {
    const birthDate = new Date(patient.birthDate);
    const ageMonths = Math.floor(
      (new Date().getTime() - birthDate.getTime()) /
        (1000 * 60 * 60 * 24 * 30.44) // Menggunakan rata-rata hari sebulan agar lebih akurat
    );

    const givenCount = new Set(
      patient.vaccineHistories.map((vh) => vh.vaccineId)
    ).size;
    const expectedByAge = calculateExpectedVaccinesByAge(ageMonths);
    const progress = Math.round((givenCount / totalVaccines) * 100);

    let status: "on-track" | "warning" | "behind" | "completed" = "on-track";
    if (givenCount >= totalVaccines) status = "completed";
    else if (givenCount < expectedByAge - 2) status = "behind";
    else if (givenCount < expectedByAge) status = "warning";

    // 2. Ambil data kunjungan terakhir dari immunizationRecords
    const latestRecord = patient.immunizationRecords[0];

    return {
      id: patient.id,
      name: patient.name,
      birthDate: patient.birthDate.toISOString(),
      gender: patient.gender,
      motherName: patient.motherName,
      nik: patient.nik,
      age: {
        months: ageMonths,
        display: formatAge(ageMonths),
      },
      vaccination: {
        given: givenCount,
        total: totalVaccines,
        progress,
        status,
      },
      // Data Tambahan untuk Card
      lastVisit: latestRecord?.schedule.date.toISOString() || null,
      lastVisitStatus: latestRecord?.status || "WAITING",
      lastVisitNotes: latestRecord?.notes || null,
    };
  });
}

function calculateExpectedVaccinesByAge(ageMonths: number): number {
  // Simple logic: 1 vaccine per month for first 12 months, then slower
  if (ageMonths <= 12) return ageMonths;
  if (ageMonths <= 24) return 12 + Math.floor((ageMonths - 12) / 2);
  return 18; // Max expected by 24 months
}

function formatAge(months: number): string {
  if (months < 12) return `${months} bulan`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} tahun`;
  return `${years} tahun ${remainingMonths} bulan`;
}

export async function getPatientDetailHistory(patientId: string) {
  await requireAdmin();

  // 1. Ambil Data Pasien beserta seluruh riwayatnya
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      // Ambil Riwayat Suntikan (yang berhasil)
      vaccineHistories: {
        include: {
          vaccine: true, // Butuh nama vaksinnya
          schedule: true, // Butuh tanggal jadwal & lokasi
        },
        orderBy: { givenAt: "desc" },
      },
      // Ambil Riwayat Kehadiran (untuk tahu kalau pernah Batal/Sakit)
      immunizationRecords: {
        include: {
          schedule: true,
        },
        orderBy: { schedule: { date: "desc" } },
      },
      posyandu: true, // Info posyandu asal
    },
  });

  if (!patient) return null;

  // 2. Ambil Master Data Vaksin (Semua jenis vaksin yang tersedia)
  // Ini penting untuk Matrix View (mengecek mana yang belum)
  const masterVaccines = await prisma.vaccine.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // 3. Hitung usia dalam bulan (untuk helper di frontend)
  const ageMonths = Math.floor(
    (new Date().getTime() - new Date(patient.birthDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30.44)
  );

  return {
    patient: {
      ...patient,
      ageMonths, // Inject umur hitungan server
    },
    masterVaccines,
  };
}
