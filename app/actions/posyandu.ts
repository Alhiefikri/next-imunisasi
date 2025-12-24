"use server";

import { PosyanduProps } from "@/hooks/use-posyandu";
import { requireAdmin } from "@/lib/auth-utils";
import prisma from "@/lib/db";

export const getPosyanduData = async () => {
  try {
    const session = await requireAdmin();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const res = await prisma.posyandu.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res;
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    throw new Error("Failed to fetch vaccines");
  }
};

export const createPosyandu = async (
  name: string,
  address: string,
  districtId: string,
  villageId: string,
  districtName: string,
  villageName: string
) => {
  try {
    const session = await requireAdmin();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const res = await prisma.posyandu.create({
      data: {
        name,
        address,
        districtId,
        villageId,
        districtName,
        villageName,
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

export const updatePosyandu = async (posyandu: PosyanduProps) => {
  try {
    const session = await requireAdmin();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const res = await prisma.posyandu.update({
      where: { id: posyandu.id },
      data: {
        name: posyandu.name,
        address: posyandu.address,
        districtId: posyandu.districtId,
        villageId: posyandu.villageId,
        districtName: posyandu.districtName,
        villageName: posyandu.villageName,
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

export const removePosyandu = async (id: string) => {
  try {
    const session = await requireAdmin();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const res = await prisma.posyandu.delete({
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
