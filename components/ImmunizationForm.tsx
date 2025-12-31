"use client";

import React, { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Syringe,
  Save,
  CheckCircle2,
  XCircle,
  Baby,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn, getAgeDetails } from "@/lib/utils"; // Gunakan utilitas usia yang sudah dibuat

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "./ui/form";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ImmunizationFormSchema, ImmunizationFormValues } from "@/lib/zod";
import {
  getImmunizationByPatient,
  upsertImmunization,
} from "@/app/actions/pelayanan";

export default function ImmunizationForm({
  patient,
  vaccines,
  scheduleId, // Tambahkan prop ini
  vaccineHistory = [],
}: {
  patient: any | null;
  vaccines: any[];
  scheduleId: string;
  vaccineHistory?: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const safeHistory = vaccineHistory ?? [];

  const form = useForm<ImmunizationFormValues>({
    resolver: zodResolver(ImmunizationFormSchema),
    defaultValues: {
      patientId: "",
      scheduleId,
      status: "SERVED", // Sesuaikan dengan enum database
      vaccines: [],
      notes: "",
    },
  });

  // FIX BUG #1: Reset form saat pasien berganti
  useEffect(() => {
    if (!patient) return;

    (async () => {
      const record = await getImmunizationByPatient(patient.id, scheduleId);

      if (!record) {
        form.reset({
          patientId: patient.id,
          scheduleId,
          status: "SERVED",
          vaccines: [],
          notes: "",
        });
        return;
      }
      form.reset({
        patientId: record.patientId,
        scheduleId: record.scheduleId,
        status: record.status,
        vaccines: record.vaccines.map((v) => v.id),
        notes: record.notes ?? "",
      });
    })();
  }, [patient, scheduleId, form]);

  const status = form.watch("status");

  if (!patient) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-xl bg-muted/20">
        <Syringe className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-medium">Pilih pasien dari antrian</p>
      </div>
    );
  }

  const onSubmit = (values: ImmunizationFormValues) => {
    startTransition(async () => {
      // FIX BUG #2 & #3: Kirim data ke Server Action
      const result = await upsertImmunization({
        patientId: values.patientId,
        scheduleId: scheduleId,
        status: values.status as any,
        vaccines: values.status === "SERVED" ? values.vaccines : [],
        notes: values.status === "CANCELLED" ? values.notes : values.notes,
      });

      if (result.success) {
        toast.success(`Data ${patient.name} berhasil disimpan`);
      } else {
        toast.error(`Gagal menyimpan data: ${JSON.stringify(result.error)}`);
      }
    });
  };

  return (
    <Card className="h-full flex flex-col shadow-md border-t-4 border-t-primary overflow-hidden bg-white">
      {/* HEADER PASIEN */}
      <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {patient.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px] h-5 py-0">
                {patient.gender === "LAKI_LAKI" ? "L" : "P"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono italic">
                {patient.motherName ? `Ibu ${patient.motherName}` : patient.nik}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">
            Usia
          </span>
          <p className="text-sm font-bold text-primary">
            {getAgeDetails(new Date(patient.birthDate))}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* RADIO STATUS */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-bold uppercase text-slate-500">
                    Kelayakan Hari Ini
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="SERVED" className="sr-only" />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            "flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all",
                            field.value === "SERVED"
                              ? "border-primary bg-blue-50/50"
                              : "border-slate-100 bg-white"
                          )}
                        >
                          <CheckCircle2
                            className={cn(
                              "mb-1 h-5 w-5",
                              field.value === "SERVED"
                                ? "text-primary"
                                : "text-slate-300"
                            )}
                          />
                          <span className="font-bold text-xs uppercase">
                            Bisa Imunisasi
                          </span>
                        </FormLabel>
                      </FormItem>

                      <FormItem>
                        <FormControl>
                          <RadioGroupItem
                            value="CANCELLED"
                            className="sr-only"
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            "flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all",
                            field.value === "CANCELLED"
                              ? "border-red-500 bg-red-50/50"
                              : "border-slate-100 bg-white"
                          )}
                        >
                          <XCircle
                            className={cn(
                              "mb-1 h-5 w-5",
                              field.value === "CANCELLED"
                                ? "text-red-500"
                                : "text-slate-300"
                            )}
                          />
                          <span className="font-bold text-xs uppercase">
                            Tunda / Batal
                          </span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* LIST VAKSIN */}
            {status === "SERVED" && (
              <div className="animate-in fade-in zoom-in-95 duration-200 space-y-4">
                <FormLabel className="text-xs font-bold uppercase text-slate-500">
                  Pilih Vaksin Diberikan
                </FormLabel>
                <div className="grid grid-cols-1 gap-2">
                  {vaccines.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="vaccines"
                      render={({ field }) => {
                        const alreadyGiven = vaccineHistory.includes(item.id);
                        return (
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-slate-50 transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={
                                  alreadyGiven || field.value?.includes(item.id)
                                }
                                disabled={alreadyGiven}
                                onCheckedChange={(checked) => {
                                  if (alreadyGiven) return;
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (v) => v !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium leading-none cursor-pointer w-full">
                              {item.name}
                            </FormLabel>
                            {alreadyGiven && (
                              <Badge variant={"secondary"}>
                                Sudah Diberikan
                              </Badge>
                            )}
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </div>
            )}

            {/* ALASAN BATAL */}
            {status === "CANCELLED" && (
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="animate-in slide-in-from-top-2">
                    <FormLabel className="text-xs font-bold text-red-600 uppercase">
                      Alasan Pembatalan
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-red-50/30 border-red-100 focus-visible:ring-red-500"
                        placeholder="Anak sakit demam..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              className="w-full font-bold shadow-md"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Rekam Medis
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
