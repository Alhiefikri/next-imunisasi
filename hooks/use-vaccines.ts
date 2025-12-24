import { create } from "zustand";

export interface VaccineProps {
  id: string;
  name: string;
  description: string | undefined;
}

interface VaccineModalProps {
  vaccine: VaccineProps | undefined;
  setVaccine: (vaccine: VaccineProps) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useVaccine = create<VaccineModalProps>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  vaccine: undefined,
  setVaccine: (vaccine: VaccineProps) => set({ vaccine }),
}));
