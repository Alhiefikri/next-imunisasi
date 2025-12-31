"use server";

import { requireAdmin } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { ImmunizationFormSchema } from "@/lib/zod";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

export async function getScheduleSummary(scheduleId: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      posyandu: true,
      records: {
        include: { patient: true },
      },
    },
  });

  if (!schedule) throw new Error("Schedule not found");

  // Semua anak target berdasarkan wilayah posyandu
  const targetPatients = await prisma.patient.findMany({
    where: {
      villageId: schedule.posyandu.villageId,
    },
    orderBy: { name: "asc" },
  });

  const totalTarget = targetPatients.length;

  // Map patientId -> status dari DB
  const recordMap = new Map(
    schedule.records.map((r) => [r.patientId, r.status])
  );

  let served = 0;
  let cancelled = 0;
  let notServed = 0;

  const patients = targetPatients.map((p) => {
    const status = recordMap.get(p.id) ?? "WAITING";

    if (status === "SERVED") served++;
    else if (status === "CANCELLED") cancelled++;
    else notServed++;

    return {
      id: p.id,
      name: p.name,
      birthDate: p.birthDate.toISOString(),
      gender: p.gender,
      status,
      motherName: p.motherName,
    };
  });

  return {
    schedule,
    totalTarget,
    served,
    notServed,
    cancelled,
    patients,
  };
}

export const getVaccines = async () => {
  const session = await requireAdmin();
  if (!session) throw new Error("Unauthorized");

  return prisma.vaccine.findMany({
    orderBy: { createdAt: "asc" },
  });
};

// ==========================
// SIMPAN / UPDATE REKAM MEDIS
// ==========================
export const upsertImmunization = async (raw: unknown) => {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = ImmunizationFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { patientId, scheduleId, status, vaccines = [], notes } = parsed.data;

  try {
    const record = await prisma.immunizationRecord.upsert({
      where: {
        patientId_scheduleId: { patientId, scheduleId },
      },

      update: {
        status,
        notes,
        vaccines:
          status === "SERVED"
            ? { set: vaccines.map((id) => ({ id })) }
            : { set: [] },
      },

      create: {
        patientId,
        scheduleId,
        status,
        notes,
        vaccines:
          status === "SERVED"
            ? { connect: vaccines.map((id) => ({ id })) }
            : undefined,
      },
    });

    revalidatePath(`/pelayanan/${scheduleId}`);

    return { success: true, data: record };
  } catch (error) {
    console.error("UPSERT IMMUNIZATION ERROR:", error);
    return { success: false, error: "Gagal menyimpan rekam imunisasi" };
  }
};

// ==========================
// HAPUS REKAM MEDIS
// ==========================
export const removeImmunizationRecord = async (
  id: string,
  scheduleId: string
) => {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.immunizationRecord.delete({ where: { id } });

    revalidatePath(`/pelayanan/${scheduleId}`);

    return { success: true };
  } catch (error) {
    console.error("DELETE IMMUNIZATION ERROR:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
};

export async function getImmunizationByPatient(
  patientId: string,
  scheduleId: string
) {
  return prisma.immunizationRecord.findUnique({
    where: {
      patientId_scheduleId: {
        patientId,
        scheduleId,
      },
    },
    include: { vaccines: true },
  });
}

export async function getPatientVaccineHistory(patientId: string) {
  const records = await prisma.immunizationRecord.findMany({
    where: {
      patientId,
      status: "SERVED",
    },
    include: {
      vaccines: true,
    },
  });

  const givenVaccineIds = new Set<string>();

 for (const record of records){
  for (const v of record.vaccines){
    givenVaccineIds.add(v.id);
  }
 }

  return Array.from(givenVaccineIds)
}
