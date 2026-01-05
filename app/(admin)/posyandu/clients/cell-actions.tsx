"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Edit, Trash, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, // Tambahkan ini
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePosyandu } from "@/hooks/use-posyandu";
import { deletePosyandu } from "@/app/actions/posyandu";

interface CellActionsProps {
  id: string;
  name: string;
  address: string;
  districtId?: string | null; // Tambahkan null karena Prisma mengirim null
  districtName?: string | null;
  villageId?: string | null;
  villageName?: string | null;
}

export default function CellActions({
  id,
  name,
  address,
  districtId,
  districtName,
  villageId,
  villageName,
}: CellActionsProps) {
  const { setPosyandu, setOpen } = usePosyandu();
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    // Mapping data agar aman dimasukkan ke Form
    setPosyandu({
      id,
      name,
      address,
      districtId: districtId ?? "",
      districtName: districtName ?? "",
      villageId: villageId ?? "",
      villageName: villageName ?? "",
    } as any);
    setOpen(true);
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePosyandu(id);
        toast.success(`Posyandu ${name} berhasil dihapus`);
        setIsDeleteModalOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menghapus");
      }
    });
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Posyandu</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{name}</strong>?
              Tindakan ini permanen dan tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
