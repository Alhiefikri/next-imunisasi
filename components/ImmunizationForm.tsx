"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Syringe,
  Save,
  CheckCircle2,
  XCircle,
  Baby,
  Loader2,
  Calendar,
  User,
  Clock,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ScrollArea } from "./ui/scroll-area";

import {
  ImmunizationFormInput,
  ImmunizationFormSchema,
  type ImmunizationFormValues,
} from "@/lib/zod";
import {
  updateImmunizationRecord,
  getPatientDetail,
} from "@/app/actions/pelayanan";
import { cn, getAgeDetails } from "@/lib/utils";
import type { Vaccine } from "@/lib/generated/prisma/client";

type PatientWithStatus = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  motherName: string | null;
  nik: string | null;
  status: "WAITING" | "SERVED" | "CANCELLED";
};

interface ImmunizationFormProps {
  scheduleId: string;
  patient: PatientWithStatus | null;
  vaccines: Vaccine[];
  onSaved?: () => void;
  isLocked?: boolean; // 👈 Tambahkan ini
}

export default function ImmunizationForm({
  scheduleId,
  patient,
  vaccines,
  onSaved,
  isLocked = false, // 👈 Default false
}: ImmunizationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [patientVaccines, setPatientVaccines] = useState<string[]>([]);

  // Gabungkan isPending dan isLocked untuk mendisable input
  const isDisabled = isPending || isLocked;

  const form = useForm<ImmunizationFormInput>({
    resolver: zodResolver(ImmunizationFormSchema),
    defaultValues: {
      patientId: "",
      scheduleId,
      status: "WAITING",
      vaccines: [],
      notes: "",
    },
  });

  const status = form.watch("status");

  // Load patient data when selected
  useEffect(() => {
    if (!patient) return;

    startTransition(async () => {
      try {
        const detail = await getPatientDetail(patient.id, scheduleId);

        // Get vaccines already given in this schedule
        const givenVaccines =
          detail.vaccineHistories
            ?.filter((vh) => vh.scheduleId === scheduleId)
            .map((vh) => vh.vaccineId) ?? [];

        setPatientVaccines(givenVaccines);

        form.reset({
          patientId: patient.id,
          scheduleId,
          status: patient.status,
          vaccines: givenVaccines,
          notes: "",
        });
      } catch (error) {
        console.error("Failed to load patient detail:", error);
      }
    });
  }, [patient, scheduleId, form]);

  if (!patient) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed bg-muted/20">
        <Syringe className="w-12 h-12 mb-4 text-muted-foreground/20" />
        <p className="font-medium text-muted-foreground">
          Pilih pasien dari daftar
        </p>
      </Card>
    );
  }

  const onSubmit = (values: ImmunizationFormInput) => {
    startTransition(async () => {
      try {
        // Logic pembersihan: Jika tidak SERVED, jangan kirim vaksin apa pun
        const cleanedValues = {
          ...values,
          vaccines: values.status === "SERVED" ? values.vaccines : [],
          notes: values.notes || "", // Pastikan tidak undefined
        };

        await updateImmunizationRecord(cleanedValues); // Kirim payload bersih
        toast.success(`Data ${patient.name} berhasil disimpan`);
        onSaved?.();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan");
      }
    });
  };

  // Filter vaccines by patient age
  const patientAge = Math.floor(
    (new Date().getTime() - new Date(patient.birthDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30)
  );

  const eligibleVaccines = vaccines.filter((v) => {
    if (!v.isActive) return false;
    if (v.ageMonthMin > patientAge) return false;
    if (v.ageMonthMax && v.ageMonthMax < patientAge) return false;
    return true;
  });

  return (
    <Card
      className={cn(
        "h-full flex flex-col shadow-md border-t-4",
        isLocked ? "border-t-slate-400 opacity-95" : "border-t-primary"
      )}
    >
      {/* Patient Header */}
      <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Baby className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold">{patient.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {patient.gender === "LAKI_LAKI" ? "L" : "P"}
              </Badge>
              {isLocked && (
                <Badge className="bg-slate-500 text-[10px] h-4">TERKUNCI</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Usia</p>
          <p className="text-sm font-bold text-primary">
            {getAgeDetails(new Date(patient.birthDate))}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Status Selection */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                      Status Pelayanan
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isDisabled} // 👈 Disable radio group
                        className="grid grid-cols-3 gap-3"
                      >
                        {/* WAITING Item */}
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="WAITING"
                              className="sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                              field.value === "WAITING"
                                ? "border-amber-500 bg-amber-50"
                                : "border-muted",
                              isLocked && "cursor-default"
                            )}
                          >
                            <Clock className="h-5 w-5 mb-1 text-amber-600" />
                            <span className="text-xs font-medium">
                              Menunggu
                            </span>
                          </FormLabel>
                        </FormItem>

                        {/* SERVED Item */}
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="SERVED"
                              className="sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                              field.value === "SERVED"
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-muted",
                              isLocked && "cursor-default"
                            )}
                          >
                            <CheckCircle2 className="h-5 w-5 mb-1 text-emerald-600" />
                            <span className="text-xs font-medium">
                              Dilayani
                            </span>
                          </FormLabel>
                        </FormItem>

                        {/* CANCELLED Item */}
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="CANCELLED"
                              className="sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                              field.value === "CANCELLED"
                                ? "border-rose-500 bg-rose-50"
                                : "border-muted",
                              isLocked && "cursor-default"
                            )}
                          >
                            <XCircle className="h-5 w-5 mb-1 text-rose-600" />
                            <span className="text-xs font-medium">Batal</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Vaccine Selection */}
              {status === "SERVED" && (
                <FormField
                  control={form.control}
                  name="vaccines"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                        Daftar Vaksin
                      </FormLabel>
                      <div className="space-y-2">
                        {eligibleVaccines.map((vaccine) => {
                          const alreadyGiven = patientVaccines.includes(
                            vaccine.id
                          );
                          return (
                            <FormField
                              key={vaccine.id}
                              control={form.control}
                              name="vaccines"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-3">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        vaccine.id
                                      )}
                                      disabled={alreadyGiven || isDisabled} // 👈 Disable checkbox
                                      onCheckedChange={(checked) => {
                                        if (alreadyGiven || isLocked) return;
                                        const currentValues = field.value || [];
                                        return checked
                                          ? field.onChange([
                                              ...currentValues,
                                              vaccine.id,
                                            ])
                                          : field.onChange(
                                              currentValues.filter(
                                                (v) => v !== vaccine.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex-1 text-sm font-medium">
                                    {vaccine.name}
                                  </div>
                                  {alreadyGiven && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      Selesai
                                    </Badge>
                                  )}
                                </FormItem>
                              )}
                            />
                          );
                        })}
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {/* Notes Field */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                      Catatan
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isDisabled} // 👈 Disable textarea
                        rows={status === "CANCELLED" ? 3 : 2}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              {!isLocked ? (
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan Data
                </Button>
              ) : (
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-center text-xs text-slate-500 font-medium">
                  Kegiatan telah selesai. Data dikunci.
                </div>
              )}
            </form>
          </Form>
        </div>
      </ScrollArea>
    </Card>
  );
}
