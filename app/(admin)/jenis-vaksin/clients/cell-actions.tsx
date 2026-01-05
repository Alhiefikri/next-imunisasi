import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useVaccine, type VaccineProps } from "@/hooks/use-vaccines";
import { deleteVaccine } from "@/app/actions/vaccines";

export default function CellActions({
  id,
  name,
  description,
  ageMonthMin,
  ageMonthMax,
  totalDoses,
  intervalDays,
  order,
  isActive,
}: VaccineProps) {
  const { setVaccine, setOpen } = useVaccine();
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    setVaccine({
      id,
      name,
      description,
      ageMonthMin,
      ageMonthMax,
      totalDoses,
      intervalDays,
      order,
      isActive,
    });
    setOpen(true);
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteVaccine(id);
        toast.success(`Vaksin ${name} berhasil dihapus`);
        router.refresh();
        setIsDeleteModalOpen(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gagal menghapus vaksin";
        toast.error(message);
      }
    });
  };

  return (
    <>
      <div className="flex justify-end gap-4">
        <Button variant="ghost" size="icon" onClick={handleEdit} title="Edit">
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDeleteModalOpen(true)}
          title="Hapus"
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Vaksin</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus vaksin <strong>{name}</strong>?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
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
              {isPending ? <Spinner className="size-4 mr-2" /> : null}
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
