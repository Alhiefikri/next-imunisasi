"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deletePatient } from "@/app/actions/patiens"; // Pastikan nama fungsi benar
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CellActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // Gunakan useTransition untuk UI yang lebih smooth
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onRemovePatient = () => {
    startTransition(async () => {
      try {
        await deletePatient(id);
        toast.success("Pasien berhasil dihapus");
        setIsDeleteModalOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal menghapus pasien"
        );
      }
    });
  };

  return (
    <>
      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-600 hover:text-blue-600"
          onClick={() => router.push(`/pasien/${id}`)}
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-600 hover:text-red-600"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Data Pasien</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data ini? <br />
              <span className="font-semibold text-red-600">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={onRemovePatient}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Pasien"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
