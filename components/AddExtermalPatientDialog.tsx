"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, UserPlus, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";

import { addPatientToSchedule } from "@/app/actions/pelayanan";
import type { Patient } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

interface AddExternalPatientDialogProps {
  open: boolean;
  onClose: () => void;
  candidates: Patient[];
  scheduleId: string;
  onSuccess?: () => void;
  isLocked?: boolean; // 👈 1. Tambahkan di interface
}

export default function AddExternalPatientDialog({
  open,
  onClose,
  candidates,
  scheduleId,
  onSuccess,
  isLocked = false, // 👈 2. Ambil dari props
}: AddExternalPatientDialogProps) {
  const [selected, setSelected] = useState<Patient | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    // 3. Tambahkan proteksi ekstra
    if (!selected || isLocked) return;

    startTransition(async () => {
      try {
        await addPatientToSchedule(selected.id, scheduleId);
        toast.success(`${selected.name} berhasil ditambahkan ke jadwal`);
        onSuccess?.();
        handleClose();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gagal menambahkan pasien";
        toast.error(message);
      }
    });
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    // 4. Cegah dialog terbuka jika isLocked
    <Dialog open={open && !isLocked} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <DialogTitle>Tambah Pasien ke Jadwal</DialogTitle>
          </div>
          <DialogDescription>
            Cari dan pilih pasien yang belum terdaftar di jadwal pelayanan hari
            ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Command className="rounded-lg border shadow-sm">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Cari nama atau NIK..."
                className="border-none focus:ring-0"
              />
            </div>
            <CommandList>
              <CommandEmpty>Pasien tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-64">
                  {candidates.map((patient) => (
                    <CommandItem
                      key={patient.id}
                      value={patient.name}
                      onSelect={() => setSelected(patient)}
                      className={cn(
                        "cursor-pointer m-1 rounded-md",
                        selected?.id === patient.id ? "bg-primary/10" : ""
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {patient.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {patient.nik || "NIK: -"}
                            {patient.motherName &&
                              ` • Ibu: ${patient.motherName}`}
                          </span>
                        </div>
                        {selected?.id === patient.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>

          {selected && (
            <div className="rounded-lg border border-primary/20 p-3 bg-primary/5">
              <p className="text-[11px] uppercase tracking-wider font-bold text-primary">
                Pasien Terpilih
              </p>
              <p className="text-sm font-medium">{selected.name}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleAdd}
              // 5. Pastikan tombol disabled jika locked atau pending
              disabled={!selected || isPending || isLocked}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  Memproses...
                </>
              ) : (
                "Tambahkan Pasien"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
