"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Edit, Trash, PlayCircle, Eye } from "lucide-react"; // Tambahkan Eye

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useJadwal, type JadwalProps } from "@/hooks/use-jadwal";
import { deleteSchedule } from "@/app/actions/jadwal";
import { cn } from "@/lib/utils";

export default function CellActions({ data }: { data: JadwalProps }) {
  const { setJadwal, setOpen } = useJadwal();
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const isCompleted = data.status === "COMPLETED";

  const handleEdit = () => {
    setJadwal(data);
    setOpen(true);
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSchedule(data.id);
        toast.success("Jadwal berhasil dihapus");
        router.refresh();
        setIsDeleteModalOpen(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gagal menghapus jadwal";
        toast.error(message);
      }
    });
  };

  const handleNavigate = () => {
    router.push(`/pelayanan/${data.id}`);
  };

  // Logic Visibility
  const canEdit = !isCompleted;
  // Hapus hanya jika belum selesai DAN belum ada data pelayanan sama sekali
  const canDelete =
    !isCompleted && (data._count?.immunizationRecords ?? 0) === 0;
  const canStartService =
    data.status === "UPCOMING" || data.status === "ONGOING";

  return (
    <>
      <div className="flex items-start justify-end gap-2">
        {/* TOMBOL LIHAT (Muncul hanya jika COMPLETED) */}
        {isCompleted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigate}
            title="Lihat Detail Pelayanan"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        {/* TOMBOL MULAI (Hanya jika belum selesai) */}
        {canStartService && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigate}
            title="Mulai Pelayanan"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <PlayCircle className="h-4 w-4" />
          </Button>
        )}

        {/* TOMBOL EDIT */}
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            title="Edit Jadwal"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}

        {/* TOMBOL HAPUS */}
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteModalOpen(true)}
            title="Hapus Jadwal"
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Jadwal</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus jadwal di{" "}
              <strong>{data.posyandu?.name}</strong> pada tanggal{" "}
              <strong>{new Date(data.date).toLocaleDateString("id-ID")}</strong>
              ?
              <br />
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
