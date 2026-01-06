"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarIcon,
  Save,
  Loader2,
  X,
  Baby,
  Users,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { VillageCombobox } from "./wilayah/VillageCombobox";
import { DistrictCombobox } from "./wilayah/DistrictCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import {
  PatientFormInput,
  PatientFormSchema,
  type PatientFormValues,
} from "@/lib/zod";
import { createPatient, updatePatient } from "@/app/actions/patiens";

export default function PatientForm({
  initialData,
  patientId,
}: {
  initialData?: Partial<PatientFormValues>;
  patientId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialData?.districtId ?? ""
  );

  const form = useForm<PatientFormInput>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      nik: initialData?.nik ?? "",
      birthDate: initialData?.birthDate
        ? new Date(initialData.birthDate)
        : undefined,
      gender: initialData?.gender ?? "LAKI_LAKI",
      placeOfBirth: initialData?.placeOfBirth ?? "",
      motherName: initialData?.motherName ?? "",
      nikmother: initialData?.nikmother ?? "",
      fatherName: initialData?.fatherName ?? "",
      nikfather: initialData?.nikfather ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      districtId: initialData?.districtId ?? "",
      villageId: initialData?.villageId ?? "",
      address: initialData?.address ?? "",
    },
  });

  const onSubmit = (values: PatientFormInput) => {
    startTransition(async () => {
      try {
        if (patientId) {
          await updatePatient(patientId, values as any);
          toast.success("Data diperbarui");
        } else {
          await createPatient(values as any);
          toast.success("Pasien berhasil disimpan");
        }
        router.push("/pasien");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <div className="p-2 md:p-6 bg-slate-50/50 min-h-screen">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-6xl mx-auto"
        >
          <Card className="shadow-md border-slate-200 overflow-hidden bg-white">
            {/* STICKY HEADER */}
            <CardHeader className="py-4 px-6 border-b bg-white sticky top-0 z-10 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Baby className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  {patientId ? "Edit Pasien" : "Registrasi Baru"}
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  <X className="h-4 w-4 mr-1" /> Batal
                </Button>
                <Button size="sm" disabled={isPending} className="shadow-sm">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Simpan Data
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* SECTION 1: DATA ANAK */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Baby className="h-4 w-4" /> IDENTITAS ANAK
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs text-slate-500 uppercase">
                          Nama Lengkap *
                        </FormLabel>
                        <Input
                          {...field}
                          placeholder="Masukkan nama sesuai KK"
                          className="h-10 focus-visible:ring-primary"
                        />
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500 uppercase">
                          NIK Anak
                        </FormLabel>
                        <Input
                          {...field}
                          placeholder="16 Digit"
                          maxLength={16}
                          className="h-10"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500 uppercase">
                          Jenis Kelamin
                        </FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex h-10 items-center gap-4 border rounded-md px-3 bg-slate-50/50"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="LAKI_LAKI" id="L" />
                            <label
                              htmlFor="L"
                              className="text-sm cursor-pointer"
                            >
                              Laki-laki
                            </label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="PEREMPUAN" id="P" />
                            <label
                              htmlFor="P"
                              className="text-sm cursor-pointer"
                            >
                              Perempuan
                            </label>
                          </div>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="placeOfBirth"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs text-slate-500 uppercase">
                          Tempat Lahir
                        </FormLabel>
                        <Input
                          {...field}
                          placeholder="Contoh: Luwuk"
                          className="h-10"
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col md:col-span-2">
                        <FormLabel className="text-xs text-slate-500 uppercase mb-1.5">
                          Tanggal Lahir *
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-10 text-left font-normal border-slate-200"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                              {field.value
                                ? format(field.value, "dd MMMM yyyy", {
                                    locale: idLocale,
                                  })
                                : "Pilih Tanggal"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* SECTION 2: DATA ORANG TUA */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Users className="h-4 w-4" /> DATA ORANG TUA & KONTAK
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* IBU */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200">
                    <FormField
                      control={form.control}
                      name="motherName"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[10px] text-indigo-500 font-bold uppercase">
                            Nama Ibu
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="Nama Ibu"
                            className="h-9 bg-white"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nikmother"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[10px] text-indigo-500 font-bold uppercase">
                            NIK Ibu
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="16 Digit"
                            maxLength={16}
                            className="h-9 bg-white"
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* AYAH */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200">
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[10px] text-slate-500 font-bold uppercase">
                            Nama Ayah
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="Nama Ayah"
                            className="h-9 bg-white"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nikfather"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[10px] text-slate-500 font-bold uppercase">
                            NIK Ayah
                          </FormLabel>
                          <Input
                            {...field}
                            placeholder="16 Digit"
                            maxLength={16}
                            className="h-9 bg-white"
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs text-slate-500 uppercase">
                          Nomor WhatsApp Aktif
                        </FormLabel>
                        <Input
                          {...field}
                          placeholder="Contoh: 08123456789"
                          className="h-10"
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* SECTION 3: ALAMAT */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <MapPin className="h-4 w-4" /> WILAYAH DOMISILI
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="districtId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500 uppercase">
                          Kecamatan
                        </FormLabel>
                        <DistrictCombobox
                          value={field.value ?? ""}
                          onChange={(id, name) => {
                            field.onChange(id);
                            setSelectedDistrict(id);
                            form.setValue("districtName", name);
                          }}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="villageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500 uppercase">
                          Kelurahan
                        </FormLabel>
                        <VillageCombobox
                          districtId={selectedDistrict}
                          value={field.value ?? ""}
                          onChange={(id, name) => {
                            field.onChange(id);
                            form.setValue("villageName", name);
                          }}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs text-slate-500 uppercase">
                          Alamat Lengkap
                        </FormLabel>
                        <Input
                          {...field}
                          placeholder="Nama Jalan, Blok, RT/RW"
                          className="h-10"
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
