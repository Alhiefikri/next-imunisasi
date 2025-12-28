"use client";

import { DataTable } from "@/components/data-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { JadwalFormSchema, JadwalFormValues } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useJadwal } from "@/hooks/use-jadwal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { createJadwal, updateJadwal } from "@/app/actions/jadwal";
import { columns } from "./columns";
import PosyanduComboBox from "@/components/PosyanduComboBox";

export default function JadwalClients({
  jadwalList,
  posyanduList,
}: {
  jadwalList: any[];
  posyanduList: any[];
}) {
  const { open, setOpen, jadwal, setJadwal } = useJadwal();
  const router = useRouter();

  const form = useForm<JadwalFormValues>({
    resolver: zodResolver(JadwalFormSchema),
    defaultValues: {
      posyanduId: "",
      date: undefined,
      notes: "",
    },
  });

  // BEST PRACTICE: Reset form saat 'jadwal' berubah (Edit vs Create)
  useEffect(() => {
    if (jadwal) {
      form.reset({
        posyanduId: jadwal.posyanduId,
        date: new Date(jadwal.date),
        notes: jadwal.notes || "",
      });
    } else {
      form.reset({
        posyanduId: "",
        date: new Date(),
        notes: "",
      });
    }
  }, [jadwal, form]);

  const onSubmit = async (values: JadwalFormValues) => {
    try {
      let res;

      if (jadwal?.id) {
        // Mode Update: Kirim objek sesuai interface JadwalProps
        res = await updateJadwal({
          id: jadwal.id,
          posyanduId: values.posyanduId,
          date: values.date,
          notes: values.notes,
          status: jadwal.status, // Tetap gunakan status lama
        });
      } else {
        // Mode Create: Kirim parameter terpisah (posyanduId, date, notes)
        res = await createJadwal(values.posyanduId, values.date, values.notes);
      }

      if (res?.success) {
        toast.success(
          jadwal ? "Jadwal berhasil diperbarui" : "Jadwal berhasil dibuat"
        );
        handleClose(); // Fungsi reset & close yang kita buat sebelumnya
        router.refresh();
      } else {
        toast.error(res?.error || "Gagal menyimpan jadwal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
  };

  // Helper untuk menutup modal dan membersihkan state
  const handleClose = () => {
    setOpen(false);
    // Timeout sedikit agar transisi modal selesai sebelum state dibersihkan
    setTimeout(() => {
      setJadwal(undefined as any);
      form.reset();
    }, 300);
  };

  return (
    <>
      {/* Gunakan handleClose pada onOpenChange agar aman */}
      <Dialog
        open={open}
        onOpenChange={(val) => (!val ? handleClose() : setOpen(true))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {jadwal ? "Edit Jadwal Imunisasi" : "Buat Jadwal Baru"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* FIELD POSYANDU */}
              <FormField
                control={form.control}
                name="posyanduId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Lokasi Posyandu{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <PosyanduComboBox
                        items={posyanduList}
                        value={field.value}
                        onSelect={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FIELD DATE */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Tanggal Pelaksanaan{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pilih Tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FIELD NOTES */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Catatan (Opsional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Contoh: Stok vaksin Polio terbatas"
                        className="resize-none text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto min-w-[120px]"
                  disabled={
                    !form.formState.isValid || form.formState.isSubmitting
                  }
                >
                  {form.formState.isSubmitting ? (
                    <Spinner className="size-4" />
                  ) : jadwal ? (
                    "Update Jadwal"
                  ) : (
                    "Simpan Jadwal"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col p-8 space-y-6">
        <div className="flex w-full justify-between items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard text-xs">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">
                  Jadwal Imunisasi
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button
            onClick={() => {
              setJadwal(undefined as any); // Pastikan state bersih sebelum buka modal create
              setOpen(true);
            }}
          >
            Buat Jadwal Baru
          </Button>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <DataTable columns={columns} data={jadwalList} />
        </div>
      </div>
    </>
  );
}
