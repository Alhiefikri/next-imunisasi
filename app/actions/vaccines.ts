"use server";

import { VaccineProps } from "@/hooks/use-vaccines";
import { requireAdmin } from "@/lib/auth-utils";
import prisma from "@/lib/db";

export const getVaccines = async () => {
  try {
    const session = await requireAdmin();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const res = await prisma.vaccine.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res;
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    throw new Error("Failed to fetch vaccines");
  }
};

export const createVaccine = async (name: string, description: string) => {
  try {
    const session = await requireAdmin();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    const res = await prisma.vaccine.create({
      data: {
        name,
        description,
      },
    });

    return res;
  } catch (error) {
    console.error("Error creating vaccine:", error);
    return {
      success: false,
      error: "Failed to create vaccine",
    };
  }
};

export const updateVaccine = async (vaccine: VaccineProps) => {
  try {
    const session = await requireAdmin();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const res = await prisma.vaccine.update({
      where: { id: vaccine.id },
      data: {
        name: vaccine.name,
        description: vaccine.description,
      },
    });

    return res;
  } catch (error) {
    console.error("Error updating vaccine:", error);
    return {
      success: false,
      error: "Failed to update vaccine",
    };
  }
};

export const removeVaccine = async (id: string) => {
  try {
    const session = await requireAdmin();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const res = await prisma.vaccine.delete({
      where: { id },
    });

    return res;
  } catch (error) {
    console.error("Error deleting vaccine:", error);
    return {
      success: false,
      error: "Failed to delete vaccine",
    };
  }
};
