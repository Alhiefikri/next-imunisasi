import { create } from "zustand";

export interface PosyanduProps {
  id: string;
  name: string;
  address: string;
  districtId: string | undefined;
  districtName: string | undefined;
  villageId: string | undefined;
  villageName: string | undefined;
}

interface PosyanduModalProps {
  posyandu: PosyanduProps | undefined;
  setPosyandu: (posyandu: PosyanduProps) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const usePosyandu = create<PosyanduModalProps>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  posyandu: undefined,
  setPosyandu: (posyandu: PosyanduProps) => set({ posyandu }),
}));
