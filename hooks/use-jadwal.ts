import { create } from "zustand";

export interface JadwalProps {
  id: string;
  posyanduId: string;
  date: Date;
  notes?: string;
  status: string;
  posyandu?: {
    name: string;
    villageName: string;
  };
}

interface JadwalModalProps {
  jadwal: JadwalProps | undefined;
  setJadwal: (jadwal: JadwalProps) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useJadwal = create<JadwalModalProps>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  jadwal: undefined,
  setJadwal: (jadwal: JadwalProps) => set({ jadwal }),
}));
