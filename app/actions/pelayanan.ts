"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { ImmunizationFormSchema } from "@/lib/zod";
import type {
  Schedule,
  Patient,
  ImmunizationRecord,
  VaccineHistory,
  Vaccine,
} from "@/lib/generated/prisma/client";

// ==================== TYPES ====================

type ScheduleWithRelations = Schedule & {
  posyandu: {
    id: string;
    name: string;
    address: string;
    villageId: string | null;
  };
  immunizationRecords: (ImmunizationRecord & {
    patient: Patient;
  })[];
};

type PatientWithStatus = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  motherName: string | null;
  nik: string | null;
  status: "WAITING" | "SERVED" | "CANCELLED";
  recordId?: string;
  vaccineCount?: number;
};

// ==================== QUERIES ====================

export async function getScheduleSummary(scheduleId: string) {
  await requireAdmin();

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      posyandu: true,
      immunizationRecords: {
        include: {
          patient: true,
        },
      },
      _count: {
        select: {
          vaccineHistories: true,
        },
      },
    },
  });

  if (!schedule) {
    throw new Error("Jadwal tidak ditemukan");
  }

  // Get village patients (target)
  const villagePatients = await prisma.patient.findMany({
    where: {
      villageId: schedule.posyandu.villageId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });

  // Get external patients (already registered)
  const externalPatients = schedule.immunizationRecords
    .map((r) => r.patient)
    .filter((p) => p.villageId !== schedule.posyandu.villageId);

  // Merge and deduplicate
  const patientMap = new Map<string, Patient>();
  [...villagePatients, ...externalPatients].forEach((p) =>
    patientMap.set(p.id, p)
  );

  const allPatients = Array.from(patientMap.values());

  // Build status map with recordId
  const recordMap = new Map(
    schedule.immunizationRecords.map((r) => [
      r.patientId,
      {
        status: r.status,
        recordId: r.id,
      },
    ])
  );

  // Get vaccine counts per patient
  const vaccineCounts = await prisma.vaccineHistory.groupBy({
    by: ["patientId"],
    where: { scheduleId },
    _count: { vaccineId: true },
  });

  const vaccineCountMap = new Map(
    vaccineCounts.map((vc) => [vc.patientId, vc._count.vaccineId])
  );

  let served = 0;
  let cancelled = 0;
  let waiting = 0;

  const patients: PatientWithStatus[] = allPatients.map((p) => {
    const record = recordMap.get(p.id);
    const status = record?.status ?? "WAITING";
    const vaccineCount = vaccineCountMap.get(p.id) ?? 0;

    if (status === "SERVED") served++;
    else if (status === "CANCELLED") cancelled++;
    else waiting++;

    return {
      id: p.id,
      name: p.name,
      birthDate: p.birthDate.toISOString(),
      gender: p.gender,
      motherName: p.motherName,
      nik: p.nik,
      status,
      recordId: record?.recordId,
      vaccineCount,
    };
  });

  return {
    schedule: {
      id: schedule.id,
      date: schedule.date.toISOString(),
      status: schedule.status,
      notes: schedule.notes,
      posyandu: schedule.posyandu,
    },
    stats: {
      totalTarget: allPatients.length,
      served,
      cancelled,
      waiting,
      totalVaccines: schedule._count.vaccineHistories,
    },
    patients,
  };
}

export async function getPatientDetail(patientId: string, scheduleId: string) {
  await requireAdmin();

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      vaccineHistories: {
        where: { scheduleId },
        include: { vaccine: true },
      },
    },
  });

  if (!patient) {
    throw new Error("Pasien tidak ditemukan");
  }

  return patient;
}

export async function getAvailableVaccines() {
  await requireAdmin();

  return await prisma.vaccine.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getCandidatePatients(scheduleId: string) {
  await requireAdmin();

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { posyandu: { select: { villageId: true } } },
  });

  if (!schedule?.posyandu.villageId) {
    throw new Error("Jadwal tidak valid");
  }

  // Get patients not yet in this schedule
  const existingRecords = await prisma.immunizationRecord.findMany({
    where: { scheduleId },
    select: { patientId: true },
  });

  const existingPatientIds = new Set(existingRecords.map((r) => r.patientId));

  return await prisma.patient.findMany({
    where: {
      isActive: true,
      id: { notIn: Array.from(existingPatientIds) },
    },
    orderBy: { name: "asc" },
  });
}

// ==================== MUTATIONS ====================

export async function addPatientToSchedule(
  patientId: string,
  scheduleId: string
) {
  await requireAdmin();

  // Check schedule status
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { status: true },
  });

  if (!schedule) {
    throw new Error("Jadwal tidak ditemukan");
  }

  if (schedule.status === "COMPLETED") {
    throw new Error("Jadwal sudah selesai, tidak dapat menambah pasien");
  }

  // Check if already exists
  const existing = await prisma.immunizationRecord.findUnique({
    where: {
      patientId_scheduleId: { patientId, scheduleId },
    },
  });

  if (existing) {
    throw new Error("Pasien sudah terdaftar di jadwal ini");
  }

  await prisma.immunizationRecord.create({
    data: {
      patientId,
      scheduleId,
      status: "WAITING",
    },
  });

  revalidatePath(`/pelayanan/${scheduleId}`);
}

export async function updateImmunizationRecord(input: unknown) {
  const session = await requireAdmin();
  const data = ImmunizationFormSchema.parse(input);

  const schedule = await prisma.schedule.findUnique({
    where: { id: data.scheduleId },
    select: { status: true },
  });

  if (schedule?.status === "COMPLETED") {
    throw new Error("Jadwal sudah selesai, tidak dapat mengubah data");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. UPSERT Record Kunjungan
    const record = await tx.immunizationRecord.upsert({
      where: {
        patientId_scheduleId: {
          patientId: data.patientId,
          scheduleId: data.scheduleId,
        },
      },
      update: {
        status: data.status,
        notes: data.notes || null,
      },
      create: {
        patientId: data.patientId,
        scheduleId: data.scheduleId,
        status: data.status,
        notes: data.notes || null,
      },
    });

    // 2. SELALU Bersihkan history lama untuk kunjungan ini agar sinkron
    await tx.vaccineHistory.deleteMany({
      where: { immunizationRecordId: record.id },
    });

    // 3. JIKA STATUS SERVED & ADA VAKSIN
    if (data.status === "SERVED" && data.vaccines.length > 0) {
      // Ambil dosis terakhir untuk tiap vaksin yang dipilih (dari sejarah pasien)
      const lastDoses = await tx.vaccineHistory.groupBy({
        by: ["vaccineId"],
        where: {
          patientId: data.patientId,
          // Jangan hitung data yang ada di recordId ini (sudah dihapus tadi)
          immunizationRecordId: { not: record.id },
        },
        _max: { doseNumber: true },
      });

      const doseMap = new Map(
        lastDoses.map((ld) => [ld.vaccineId, ld._max.doseNumber ?? 0])
      );

      // Mapping data dengan memasukkan immunizationRecordId
      const histories = data.vaccines.map((vId) => ({
        patientId: data.patientId,
        vaccineId: vId,
        scheduleId: data.scheduleId,
        immunizationRecordId: record.id, // ✅ WAJIB ADA (Sesuai Schema)
        doseNumber: (doseMap.get(vId) ?? 0) + 1,
        givenAt: new Date(),
        administeredBy: session.user.id,
      }));

      // Simpan banyak sekaligus
      await tx.vaccineHistory.createMany({
        data: histories,
      });
    }

    revalidatePath(`/pelayanan/${data.scheduleId}`);
    return record;
  });
}

export async function removePatientFromSchedule(
  patientId: string,
  scheduleId: string
) {
  await requireAdmin();

  // Check schedule status
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { status: true },
  });

  if (schedule?.status === "COMPLETED") {
    throw new Error("Jadwal sudah selesai, tidak dapat menghapus pasien");
  }

  await prisma.$transaction(async (tx) => {
    // Delete vaccine histories first
    await tx.vaccineHistory.deleteMany({
      where: { patientId, scheduleId },
    });

    // Delete immunization record
    await tx.immunizationRecord.delete({
      where: {
        patientId_scheduleId: { patientId, scheduleId },
      },
    });
  });

  revalidatePath(`/pelayanan/${scheduleId}`);
}

export async function completeSchedule(scheduleId: string) {
  await requireAdmin();

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { status: true },
  });

  if (schedule?.status === "COMPLETED") {
    throw new Error("Jadwal sudah selesai");
  }

  await prisma.$transaction(async (tx) => {
    // Update schedule status
    await tx.schedule.update({
      where: { id: scheduleId },
      data: { status: "COMPLETED" },
    });

    // Lock all vaccine histories
    await tx.vaccineHistory.updateMany({
      where: { scheduleId },
      data: { isLocked: true },
    });
  });

  revalidatePath(`/pelayanan/${scheduleId}`);
  revalidatePath("/dashboard/jadwal");
}
