"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

import { useJadwal } from "@/hooks/use-jadwal";
import { ScheduleFormSchema, type ScheduleFormValues } from "@/lib/zod";
import { createSchedule, updateSchedule } from "@/app/actions/jadwal";
import { cn } from "@/lib/utils";
import type { Schedule, Posyandu } from "@/lib/generated/prisma/client";
import { columns } from "./columns";

type ScheduleWithRelations = Schedule & {
  posyandu: Posyandu;
  _count: {
    immunizationRecords: number;
    vaccineHistories: number;
  };
};

interface JadwalClientsProps {
  schedules: ScheduleWithRelations[];
  posyandus: Posyandu[];
}

export default function JadwalClients({
  schedules,
  posyandus,
}: JadwalClientsProps) {
  const { open, setOpen, jadwal, setJadwal } = useJadwal();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(ScheduleFormSchema),
    defaultValues: {
      posyanduId: "",
      date: new Date(),
      notes: "",
    },
  });

  useEffect(() => {
    if (jadwal) {
      form.reset({
        posyanduId: jadwal.posyanduId,
        date: new Date(jadwal.date),
        notes: jadwal.notes ?? "",
      });
    } else {
      form.reset({
        posyanduId: "",
        date: new Date(),
        notes: "",
      });
    }
  }, [jadwal, form]);

  const onSubmit = (values: ScheduleFormValues) => {
    startTransition(async () => {
      try {
        if (jadwal?.id) {
          await updateSchedule(jadwal.id, values);
          toast.success("Jadwal berhasil diperbarui");
        } else {
          await createSchedule(values);
          toast.success("Jadwal berhasil dibuat");
        }

        router.refresh();
        handleClose();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Terjadi kesalahan";
        toast.error(message);
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
    setJadwal(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => (!val ? handleClose() : setOpen(true))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {jadwal ? "Edit Jadwal" : "Tambah Jadwal"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="posyanduId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posyandu *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih posyandu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {posyandus.map((posyandu) => (
                          <SelectItem key={posyandu.id} value={posyandu.id}>
                            {posyandu.name}
                            {posyandu.villageName && (
                              <span className="text-xs text-muted-foreground ml-2">
                                • {posyandu.villageName}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isPending}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd MMMM yyyy", {
                                locale: idLocale,
                              })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Tanggal pelaksanaan kegiatan posyandu
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Catatan tambahan (opsional)"
                        rows={3}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className="size-4 mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col p-8">
        <div className="flex w-full justify-between items-center mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Jadwal</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button onClick={() => setOpen(true)}>Tambah Jadwal</Button>
        </div>

        <DataTable columns={columns} data={schedules} />
      </div>
    </>
  );
}
