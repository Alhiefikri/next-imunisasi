"use client";

import { removeJadwal } from "@/app/actions/jadwal"; // Pastikan path action benar
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { JadwalProps, useJadwal } from "@/hooks/use-jadwal";
import { Edit, Trash, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CellActions({ data }: { data: JadwalProps }) {
  const { setJadwal, setOpen } = useJadwal();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  console.log("CellActions data:", data);

  // Fungsi Hapus Jadwal
  const onRemoveJadwal = async () => {
    try {
      setIsLoading(true);
      const res = await removeJadwal(data.id);

      if (res.success) {
        toast.success(`Jadwal di berhasil dihapus.`);
        setIsDeleteModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus jadwal");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4">
        {/* Tombol Mulai Pelayanan (Hanya muncul jika belum selesai) */}
        {data.status !== "COMPLETED" && data.status !== "CANCELLED" && (
          <div
            className="cursor-pointer text-emerald-600 hover:text-emerald-700 transition"
            title="Mulai Pelayanan"
            onClick={() => router.push(`/pelayanan/${data.id}`)}
          >
            <PlayCircle className="h-5 w-5" />
          </div>
        )}

        {/* Tombol Edit */}
        <div
          className="cursor-pointer text-slate-600 hover:text-primary transition"
          title="Edit"
          onClick={() => {
            setOpen(true);
            setJadwal(data); // Mengirim seluruh data jadwal ke store/state
          }}
        >
          <Edit className="h-5 w-5" />
        </div>

        {/* Tombol Delete */}
        <div
          className="cursor-pointer text-rose-500 hover:text-rose-700 transition"
          title="Delete"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash className="h-5 w-5" />
        </div>
      </div>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md flex flex-col gap-6">
          <DialogHeader className="gap-2">
            <DialogTitle>Hapus Jadwal</DialogTitle>
            <DialogDescription className="text-sm">
              Apakah Anda yakin ingin menghapus jadwal di{" "}
              <span className="font-bold text-slate-900">
                {data.posyandu?.name}
              </span>
              ? Catatan medis yang terkait dengan jadwal ini mungkin akan
              terdampak.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              className="min-w-24 justify-center"
              disabled={isLoading}
              onClick={onRemoveJadwal}
            >
              {isLoading ? <Spinner className="size-4" /> : "Ya, Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
