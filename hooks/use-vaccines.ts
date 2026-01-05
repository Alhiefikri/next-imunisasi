import { create } from "zustand";

export interface VaccineProps {
  id: string;
  name: string;
  description?: string;
  ageMonthMin: number;
  ageMonthMax?: number;
  totalDoses: number;
  intervalDays?: number;
  order: number;
  isActive: boolean;
}

interface VaccineModalProps {
  vaccine: VaccineProps | null;
  setVaccine: (vaccine: VaccineProps | null) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useVaccine = create<VaccineModalProps>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  vaccine: null,
  setVaccine: (vaccine) => set({ vaccine }),
}));
