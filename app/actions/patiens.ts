"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { PatientFormSchema } from "@/lib/zod";

// ==================== HELPERS ====================

async function checkNIKExists(
  payload: {
    nik?: string | null;
    nikmother?: string | null;
    nikfather?: string | null;
  },
  excludeId?: string
) {
  // Hanya masukkan field yang ada isinya ke dalam query OR
  const conditions = Object.entries(payload)
    .filter(([_, value]) => !!value)
    .map(([key, value]) => ({ [key]: value }));

  if (conditions.length === 0) return null;

  const duplicate = await prisma.patient.findFirst({
    where: {
      isActive: true, // Opsional: apakah NIK yang sudah "dihapus" boleh dipakai lagi?
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

export async function getPatients() {
  await requireAdmin(); // Pastikan hanya admin yang bisa akses

  return await prisma.patient.findMany({
    where: { isActive: true }, // Hapus userId agar semua admin bisa lihat
    orderBy: { createdAt: "desc" },
    include: {
      vaccineHistories: { include: { vaccine: true } },
    },
  });
}

export async function getPatient(id: string) {
  await requireAdmin();

  return await prisma.patient.findFirst({
    where: { id, isActive: true }, // Hapus userId
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

// ==================== MUTATIONS ====================

export async function createPatient(input: unknown) {
  const session = await requireAdmin();
  const data = PatientFormSchema.parse(input);

  // KOREKSI: Bungkus dalam object sesuai definisi helper
  const duplicateError = await checkNIKExists({
    nik: data.nik,
    nikmother: data.nikmother,
    nikfather: data.nikfather,
  });

  if (duplicateError) throw new Error(duplicateError);

  const patient = await prisma.patient.create({
    data: {
      ...data,
      userId: session.user.id, // Penanda siapa yang mendaftarkan pertama kali
      birthDate: new Date(data.birthDate!),
    },
  });

  revalidatePath("/dashboard/patients");
  return patient;
}

export async function updatePatient(id: string, input: unknown) {
  await requireAdmin();
  const data = PatientFormSchema.parse(input);

  // KOREKSI: Gunakan object payload
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
      where: { id }, // Hapus userId agar admin lain bisa edit
      data,
    });

    revalidatePath("/dashboard/patients");
    revalidatePath(`/dashboard/patients/${id}`);
    return patient;
  } catch (error) {
    throw new Error("Pasien tidak ditemukan");
  }
}

export async function deletePatient(id: string) {
  await requireAdmin();

  await prisma.patient.update({
    where: { id }, // Hapus userId
    data: { isActive: false },
  });

  revalidatePath("/dashboard/patients");
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
