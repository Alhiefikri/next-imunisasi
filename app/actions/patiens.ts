// app/actions/patients.ts (UPDATE)
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { PatientFormSchema } from "@/lib/zod";

// ==================== TYPES ====================

export type PatientFilters = {
  search?: string;
  gender?: "LAKI_LAKI" | "PEREMPUAN";
  ageMin?: number;
  ageMax?: number;
  districtId?: string;
  villageId?: string;
  vaccinationStatus?: "completed" | "on-track" | "behind";
};

// ==================== HELPERS ====================

async function checkNIKExists(
  payload: {
    nik?: string | null;
    nikmother?: string | null;
    nikfather?: string | null;
  },
  excludeId?: string
) {
  const conditions = Object.entries(payload)
    .filter(([_, value]) => !!value)
    .map(([key, value]) => ({ [key]: value }));

  if (conditions.length === 0) return null;

  const duplicate = await prisma.patient.findFirst({
    where: {
      isActive: true,
      id: excludeId ? { not: excludeId } : undefined,
      OR: conditions,
    },
  });

  if (!duplicate) return null;
  if (payload.nik && duplicate.nik === payload.nik)
    return "NIK anak sudah terdaftar";
  if (payload.nikmother && duplicate.nikmother === payload.nikmother)
    return "NIK ibu sudah terdaftar";
  return "NIK orang tua sudah terdaftar";
}

// ==================== QUERIES ====================

export async function getPatients(filters?: PatientFilters) {
  await requireAdmin();

  // Build where clause
  const where: any = { isActive: true };

  // Search filter
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { nik: { contains: filters.search } },
      { motherName: { contains: filters.search, mode: "insensitive" } },
      { fatherName: { contains: filters.search, mode: "insensitive" } },
      { phoneNumber: { contains: filters.search } },
    ];
  }

  // Gender filter
  if (filters?.gender) {
    where.gender = filters.gender;
  }

  // Location filters
  if (filters?.districtId) {
    where.districtId = filters.districtId;
  }
  if (filters?.villageId) {
    where.villageId = filters.villageId;
  }

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      vaccineHistories: {
        select: { vaccineId: true },
        distinct: ["vaccineId"],
      },
      posyandu: { select: { name: true } },
    },
  });

  // Age and vaccination status filters (post-query)
  const totalVaccines = await prisma.vaccine.count({
    where: { isActive: true },
  });

  let filteredPatients = patients.map((p) => {
    const birthDate = new Date(p.birthDate);
    const ageMonths = Math.floor(
      (new Date().getTime() - birthDate.getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    );

    const givenCount = p.vaccineHistories.length;
    const coverage = Math.round((givenCount / totalVaccines) * 100);

    let vaccinationStatus: "completed" | "on-track" | "behind" = "on-track";
    if (coverage >= 100) vaccinationStatus = "completed";
    else if (coverage < 60) vaccinationStatus = "behind";

    return {
      ...p,
      ageMonths,
      givenCount,
      totalVaccines,
      coverage,
      vaccinationStatus,
    };
  });

  // Apply age filters
  if (filters?.ageMin !== undefined) {
    filteredPatients = filteredPatients.filter(
      (p) => p.ageMonths >= filters.ageMin!
    );
  }
  if (filters?.ageMax !== undefined) {
    filteredPatients = filteredPatients.filter(
      (p) => p.ageMonths <= filters.ageMax!
    );
  }

  // Apply vaccination status filter
  if (filters?.vaccinationStatus) {
    filteredPatients = filteredPatients.filter(
      (p) => p.vaccinationStatus === filters.vaccinationStatus
    );
  }

  return filteredPatients;
}

export async function getPatient(id: string) {
  await requireAdmin();

  return await prisma.patient.findFirst({
    where: { id, isActive: true },
    include: {
      vaccineHistories: {
        include: { vaccine: true, schedule: true },
        orderBy: { givenAt: "desc" },
      },
      immunizationRecords: {
        include: { schedule: { include: { posyandu: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getDistrictsWithPatients() {
  await requireAdmin();

  const patients = await prisma.patient.findMany({
    where: { isActive: true, districtId: { not: null } },
    select: { districtId: true, districtName: true },
    distinct: ["districtId"],
  });

  return patients
    .filter((p) => p.districtId && p.districtName)
    .map((p) => ({
      id: p.districtId!,
      name: p.districtName!,
    }));
}

export async function getVillagesByDistrict(districtId: string) {
  await requireAdmin();

  const patients = await prisma.patient.findMany({
    where: { isActive: true, districtId, villageId: { not: null } },
    select: { villageId: true, villageName: true },
    distinct: ["villageId"],
  });

  return patients
    .filter((p) => p.villageId && p.villageName)
    .map((p) => ({
      id: p.villageId!,
      name: p.villageName!,
    }));
}

// ==================== MUTATIONS ====================

export async function createPatient(input: unknown) {
  const session = await requireAdmin();
  const data = PatientFormSchema.parse(input);

  const duplicateError = await checkNIKExists({
    nik: data.nik,
    nikmother: data.nikmother,
    nikfather: data.nikfather,
  });

  if (duplicateError) throw new Error(duplicateError);

  const patient = await prisma.patient.create({
    data: {
      ...data,
      userId: session.user.id,
      birthDate: new Date(data.birthDate!),
    },
  });

  revalidatePath("/pasien");
  return patient;
}

export async function updatePatient(id: string, input: unknown) {
  await requireAdmin();
  const data = PatientFormSchema.parse(input);

  const duplicateError = await checkNIKExists(
    {
      nik: data.nik,
      nikmother: data.nikmother,
      nikfather: data.nikfather,
    },
    id
  );

  if (duplicateError) throw new Error(duplicateError);

  try {
    const patient = await prisma.patient.update({
      where: { id },
      data,
    });

    revalidatePath("/pasien");
    revalidatePath(`/pasien/${id}`);
    return patient;
  } catch (error) {
    throw new Error("Pasien tidak ditemukan");
  }
}

export async function deletePatient(id: string) {
  await requireAdmin();

  await prisma.patient.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/pasien");
}

export async function searchPatients(query: string) {
  await requireAdmin();

  return await prisma.patient.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { nik: { contains: query } },
        { motherName: { contains: query, mode: "insensitive" } },
        { fatherName: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });
}
