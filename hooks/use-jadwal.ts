import { create } from "zustand";

export interface JadwalProps {
  id: string;
  posyanduId: string;
  date: Date;
  notes?: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  posyandu?: {
    id: string;
    name: string;
    address: string;
    districtName?: string;
    villageName?: string;
  };
  _count?: {
    immunizationRecords: number;
    vaccineHistories: number;
  };
}

interface JadwalModalProps {
  jadwal: JadwalProps | null;
  setJadwal: (jadwal: JadwalProps | null) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useJadwal = create<JadwalModalProps>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  jadwal: null,
  setJadwal: (jadwal) => set({ jadwal }),
}));
