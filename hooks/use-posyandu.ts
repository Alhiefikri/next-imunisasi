import { create } from "zustand";

export interface PosyanduProps {
  id: string;
  name: string;
  address: string;
  districtId?: string;
  districtName?: string;
  villageId?: string;
  villageName?: string;
}

interface PosyanduModalProps {
  posyandu: PosyanduProps | null; // ✅ Ganti undefined jadi null
  setPosyandu: (posyandu: PosyanduModalProps | null) => void; // ✅ Accept null
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const usePosyandu = create<PosyanduModalProps>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  posyandu: null, // ✅ Default null
  setPosyandu: (posyandu) => set({ posyandu }),
}));
