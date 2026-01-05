"use client";

import { useTransition, useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { completeSchedule } from "@/app/actions/pelayanan";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompleteScheduleButtonProps {
  scheduleId: string;
  isCompleted: boolean;
  waitingCount: number;
  totalServed: number;
}

export default function CompleteScheduleButton({
  scheduleId,
  isCompleted,
  waitingCount,
  totalServed,
}: CompleteScheduleButtonProps) {
  const [isPending, startTransition] = useTransition();

  // Tombol aktif HANYA JIKA:
  // 1. Belum completed
  // 2. Tidak ada lagi pasien yang WAITING
  // 3. Setidaknya ada 1 pasien yang sudah dilayani/dilayani (opsional, tergantung kebijakan)
  const canComplete = !isCompleted && waitingCount === 0 && totalServed > 0;

  const handleComplete = () => {
    startTransition(async () => {
      try {
        await completeSchedule(scheduleId);
        toast.success("Jadwal resmi diselesaikan dan data dikunci.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal menyelesaikan jadwal"
        );
      }
    });
  };

  if (isCompleted) {
    return (
      <Button
        variant="outline"
        disabled
        className="bg-emerald-50 text-emerald-600 border-emerald-200"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Sudah Selesai
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={!canComplete || isPending}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Selesaikan Jadwal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Selesaikan Kegiatan Posyandu?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan mengunci semua data imunisasi pada hari ini. Anda
            tidak akan bisa menambah atau mengubah data pelayanan lagi setelah
            jadwal dinyatakan <strong>COMPLETED</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleComplete}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Ya, Selesaikan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
