"use server";

import { AuthSession, requireAdmin } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { Patient, Prisma } from "@/lib/generated/prisma/client";
import { PatientformSchema, PatientFormValues } from "@/lib/zod";

export const getAllPatiens = async () => {
  try {
    const session = await AuthSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

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
    if (!session) {
      throw new Error("Unauthorized");
    }
    const res = (await prisma.patient.findUnique({ where: { id } })) as Patient;
    return res;
  } catch (error) {
    console.error("Error fetching patient:", error);
  }
};

export const createPatient = async (params: PatientFormValues) => {
  try {
    const session = await requireAdmin();
    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Validasi data dengan Zod
    const validatedFields = PatientformSchema.safeParse(params);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Data tidak valid",
        details: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { id, ...rest } = validatedFields.data;

    // Cek apakah NIK sudah ada
    if (rest.nik) {
      const exists = await prisma.patient.findUnique({
        where: { nik: rest.nik },
      });

      if (exists) {
        return {
          success: false,
          error: "NIK sudah terdaftar",
          code: "DUPLICATE_NIK",
        };
      }
    }

    // Buat patient baru
    const patient = await prisma.patient.create({
      data: {
        ...rest,
        userId: session.user.id,
      },
    });

    return {
      success: true,
      data: patient,
    };
  } catch (error) {
    console.error("Error creating patient:", error);

    // Handle Prisma unique constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "NIK sudah terdaftar",
          code: "DUPLICATE_NIK",
        };
      }
    }

    return {
      success: false,
      error: "Gagal membuat data pasien",
    };
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

    // Pastikan ID ada untuk proses update
    const { id, ...rest } = validatedFields.data;
    if (!id)
      return { success: false, error: "ID Pasien diperlukan untuk update" };

    // PERBAIKAN LOGIKA NIK:
    // Cek NIK hanya jika NIK dikirimkan
    if (rest.nik) {
      const existingPatient = await prisma.patient.findFirst({
        where: {
          nik: rest.nik,
          NOT: { id: id }, // Cari NIK yang sama TAPI bukan milik pasien ini
        },
      });

      if (existingPatient) {
        return {
          success: false,
          error: "NIK sudah digunakan oleh pasien lain",
          code: "DUPLICATE_NIK",
        };
      }
    }

    // Update data
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...rest,
      },
    });

    return { success: true, data: patient };
  } catch (error) {
    console.error("Error update patient:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "NIK sudah terdaftar",
          code: "DUPLICATE_NIK",
        };
      }
      if (error.code === "P2025") {
        return { success: false, error: "Data pasien tidak ditemukan" };
      }
    }

    return { success: false, error: "Gagal ubah data pasien" };
  }
};

export const removePatient = async (id: string) => {
  try {
    const session = await requireAdmin();
    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const res = await prisma.patient.delete({
      where: { id },
    });
    return res;
  } catch (error) {
    console.error("Error fetching patient:", error);
    return {
      success: false,
      error: "Gagal menghapus data pasien",
    };
  }
};
