"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

import { useVaccine } from "@/hooks/use-vaccines";
import {
  VaccineFormInput,
  VaccineFormSchema,
  type VaccineFormValues,
} from "@/lib/zod";
import { createVaccine, updateVaccine } from "@/app/actions/vaccines";
import type { Vaccine } from "@/lib/generated/prisma/client";
import { columns } from "./columns";

export default function VaccinesClient({ vaccines }: { vaccines: Vaccine[] }) {
  const { open, setOpen, vaccine, setVaccine } = useVaccine();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<VaccineFormInput>({
    resolver: zodResolver(VaccineFormSchema),
    defaultValues: {
      name: "",
      description: "",
      ageMonthMin: 0,
      ageMonthMax: undefined,
      totalDoses: 1,
      intervalDays: undefined,
      order: 0,
      isActive: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (vaccine) {
      form.reset({
        name: vaccine.name,
        description: vaccine.description ?? "",
        ageMonthMin: vaccine.ageMonthMin,
        ageMonthMax: vaccine.ageMonthMax ?? undefined,
        totalDoses: vaccine.totalDoses,
        intervalDays: vaccine.intervalDays ?? undefined,
        order: vaccine.order,
        isActive: vaccine.isActive,
      });
    } else {
      form.reset();
    }
  }, [vaccine, form]);

  const onSubmit = (data: VaccineFormInput) => {
    startTransition(async () => {
      try {
        if (vaccine?.id) {
          await updateVaccine(vaccine.id, data);
          toast.success("Vaksin berhasil diperbarui");
        } else {
          await createVaccine(data);
          toast.success("Vaksin berhasil dibuat");
        }

        router.refresh();
        form.reset();
        setVaccine(null);
        setOpen(false);
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
    setVaccine(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {vaccine ? "Edit Vaksin" : "Tambah Vaksin"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Vaksin *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Contoh: BCG, Polio, DPT"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Deskripsi vaksin dan manfaatnya"
                          rows={3}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ageMonthMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usia Minimal (Bulan) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Usia minimal pemberian vaksin
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageMonthMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usia Maksimal (Bulan)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Kosongkan jika tidak ada batas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Doses & Interval */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalDoses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Dosis *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={1}
                          max={5}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>Maksimal 5 dosis</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intervalDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval Antar Dosis (Hari)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>Wajib jika dosis &gt; 1</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urutan Tampilan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Urutan di form imunisasi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vaksin Aktif</FormLabel>
                        <FormDescription>
                          Tampilkan di form imunisasi
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

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
        <div className="flex w-full justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Vaksin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button onClick={() => setOpen(true)}>Tambah Vaksin</Button>
        </div>

        <div className="p-8">
          <DataTable data={vaccines} columns={columns} />
        </div>
      </div>
    </>
  );
}
