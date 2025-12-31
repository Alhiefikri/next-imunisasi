"use server";

import { AuthSession, requireAdmin } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { Patient, Prisma } from "@/lib/generated/prisma/client";
import { PatientformSchema, PatientFormValues } from "@/lib/zod";

// --- Helper untuk menangani Error Unik (NIK/NIK Mother/NIK Father) ---
const handleUniqueConstraintError = (error: any) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    // Prisma memberitahu field mana yang error di error.meta.target
    const target = error.meta?.target as string[];

    if (target?.includes("nik")) {
      return { error: "NIK Pasien sudah terdaftar", field: "nik" };
    }
    if (target?.includes("nikMother")) {
      return {
        error: "NIK Ibu sudah terdaftar pada pasien lain",
        field: "nikMother",
      };
    }
    if (target?.includes("nikFather")) {
      return {
        error: "NIK Ayah sudah terdaftar pada pasien lain",
        field: "nikFather",
      };
    }
    return { error: "Data unik sudah ada di database" };
  }
  return null; // Bukan error unique constraint
};

export const getAllPatiens = async () => {
  try {
    const session = await AuthSession();
    if (!session) throw new Error("Unauthorized");

    const res = await prisma.patient.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
    });
    return res;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw new Error("Failed to fetch patients");
  }
};

export const getUniquePatient = async (id: string) => {
  try {
    const session = await requireAdmin();
    if (!session) throw new Error("Unauthorized");

    const res = (await prisma.patient.findUnique({ where: { id } })) as Patient;
    return res;
  } catch (error) {
    console.error("Error fetching patient:", error);
  }
};

export const createPatient = async (params: PatientFormValues) => {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: "Unauthorized" };

    // Validasi Zod
    const validatedFields = PatientformSchema.safeParse(params);
    if (!validatedFields.success) {
      return {
        success: false,
        error: "Data tidak valid",
        details: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { id, ...rest } = validatedFields.data;

    // Langsung Create. Jika duplikat, akan masuk ke catch.
    // Kita hapus pengecekan manual findUnique di sini agar hemat query.
    const patient = await prisma.patient.create({
      data: {
        ...rest,
        // Pastikan null jika string kosong agar unique constraint bekerja benar
        nik: rest.nik || null,
        nikmother: rest.nikmother || null,
        nikfather: rest.nikfather || null,
        userId: session.user.id,
      },
    });

    return { success: true, data: patient };
  } catch (error) {
    console.error("Error creating patient:", error);

    // Cek error unik menggunakan helper
    const uniqueError = handleUniqueConstraintError(error);
    if (uniqueError) {
      return {
        success: false,
        error: uniqueError.error,
        code: "DUPLICATE_ENTRY",
      };
    }

    return { success: false, error: "Gagal membuat data pasien" };
  }
};

export const updatePatient = async (params: PatientFormValues) => {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: "Unauthorized" };

    const validatedFields = PatientformSchema.safeParse(params);
    if (!validatedFields.success) {
      return {
        success: false,
        error: "Data tidak valid",
        details: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { id, ...rest } = validatedFields.data;
    if (!id) return { success: false, error: "ID Pasien diperlukan" };

    // Langsung Update. Prisma otomatis handle pengecekan unik "kecuali diri sendiri"
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...rest,
        // Pastikan string kosong ("") diubah jadi null agar tidak dianggap duplikat
        nik: rest.nik || null,
        nikMother: rest.nikMother || null,
        nikFather: rest.nikFather || null,
      },
    });

    return { success: true, data: patient };
  } catch (error) {
    console.error("Error update patient:", error);

    // Cek error unik menggunakan helper
    const uniqueError = handleUniqueConstraintError(error);
    if (uniqueError) {
      return {
        success: false,
        error: uniqueError.error,
        code: "DUPLICATE_ENTRY",
      };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Data pasien tidak ditemukan" };
    }

    return { success: false, error: "Gagal ubah data pasien" };
  }
};

export const removePatient = async (id: string) => {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: "Unauthorized" };

    const res = await prisma.patient.delete({
      where: { id },
    });
    return res;
  } catch (error) {
    console.error("Error deleting patient:", error);
    return { success: false, error: "Gagal menghapus data pasien" };
  }
};
