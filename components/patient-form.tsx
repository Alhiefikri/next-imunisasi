"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Save,
  Loader2,
  X,
  Baby,
  MapPinHouse,
} from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { PatientformSchema, PatientFormValues } from "@/lib/zod";
import { createPatient, updatePatient } from "@/app/actions/patiens";

import { VillageCombobox } from "./wilayah/VillageCombobox";
import { Textarea } from "./ui/textarea";
import { DistrictCombobox } from "./wilayah/DistrictCombobox";

export default function PatientForm({
  id,
  name,
  nik,
  birthDate,
  gender,
  placeOfBirth,
  parentName,
  phoneNumber,
  districtId,
  districtName,
  villageId,
  villageName,
  address,
}: Partial<PatientFormValues>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientformSchema),
    defaultValues: {
      id: id || undefined,
      name: name || "",
      nik: nik || "",
      birthDate: birthDate || undefined,
      gender: gender || undefined,
      placeOfBirth: placeOfBirth || "",
      parentName: parentName || "",
      phoneNumber: phoneNumber || "",
      districtId: districtId || undefined,
      districtName: districtName || undefined,
      villageId: villageId || undefined,
      villageName: villageName || undefined,
      address: address || "",
    },
    mode: "onChange",
  });

  const districtValue = form.watch("districtId");

  useEffect(() => {
    setSelectedDistrict(districtValue || "");
  }, [districtValue]);

  const handleDistrictChange = (id: string, name: string) => {
    form.setValue("districtId", id);
    form.setValue("districtName", name); // Simpan Nama Kecamatan

    // Reset kelurahan jika kecamatan berubah
    form.setValue("villageId", "");
    form.setValue("villageName", "");
  };

  const handleVillageChange = (id: string, name: string) => {
    form.setValue("villageId", id);
    form.setValue("villageName", name); // Simpan Nama Kelurahan
  };

  const onSubmit = async (values: PatientFormValues) => {
    startTransition(async () => {
      try {
        const result = id
          ? await updatePatient(values)
          : await createPatient(values);

        if (!result.success) {
          if (result.code === "DUPLICATE_NIK") {
            form.setError("nik", {
              message: "NIK Sudah Terdaftar",
            });
            toast.error("NIK Duplikat", {
              description: "Silakan periksa kembali data Anda.",
            });
          } else {
            toast.error("Gagal Menyimpan", {
              description: result.error,
            });
          }
          return;
        }

        toast.success(id ? "Berhasil Diperbarui" : "Berhasil Didaftarkan");
        if (!id) form.reset();

        setTimeout(() => {
          router.push("/pasien");
          router.refresh();
        }, 500);
      } catch (error) {
        toast.error("Error Sistem", { description: "Coba lagi nanti." });
      }
    });
  };

  return (
    // Container utama set tinggi layar penuh (h-screen) agar compact
    <div className="flex flex-col h-[calc(100vh-(--spacing(4)))] md:h-screen bg-muted/40">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* 1. HEADER (Fixed) */}
          <div className="flex-none px-6 py-3 bg-background border-b flex items-center justify-between sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {id ? "Edit Data Pasien" : "Registrasi Pasien Baru"}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {id
                  ? "Mode perbaikan data"
                  : "Pastikan data sesuai Kartu Keluarga (KK)"}
              </p>
            </div>
            <div className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {form.formState.isDirty ? "Belum Disimpan" : "Form Siap"}
            </div>
          </div>

          {/* 2. CONTENT AREA (Scrollable internal, layout 2 kolom sama tinggi) */}
          <div className="flex-1 overflow-hidden p-4 md:p-6">
            <div className="mx-auto max-w-7xl h-full">
              {/* Grid Container: h-full forcing equal height cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                {/* --- KARTU KIRI: DATA ANAK (Identitas + Kelahiran) --- */}
                <Card className="shadow-sm border-border/60 flex flex-col h-full overflow-hidden">
                  <CardHeader className="pb-3 pt-4 px-5 bg-muted/20 border-b flex-none">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-primary">
                      <Baby className="w-4 h-4" /> Data Identitas Anak
                    </CardTitle>
                  </CardHeader>
                  {/* CardContent scrollable jika layar terlalu pendek */}
                  <CardContent className="p-5 space-y-4 flex-1 overflow-y-auto">
                    {/* Nama */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                            Nama Lengkap{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nama sesuai akta..."
                              className="h-9 text-sm"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* NIK */}
                    <FormField
                      control={form.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                            NIK (16 Digit)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nomor Induk Kependudukan"
                              maxLength={16}
                              className="h-9 text-sm font-mono"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                            Jenis Kelamin{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-3 pt-1"
                              disabled={isPending}
                            >
                              <label
                                className={cn(
                                  "cursor-pointer border rounded-md p-2 flex items-center justify-center gap-2 transition-all hover:bg-accent",
                                  field.value === "LAKI_LAKI" &&
                                    "border-primary bg-primary/10 ring-1 ring-primary"
                                )}
                              >
                                <RadioGroupItem
                                  value="LAKI_LAKI"
                                  className="sr-only"
                                />
                                <span className="text-sm font-medium">
                                  Laki-laki
                                </span>
                              </label>
                              <label
                                className={cn(
                                  "cursor-pointer border rounded-md p-2 flex items-center justify-center gap-2 transition-all hover:bg-accent",
                                  field.value === "PEREMPUAN" &&
                                    "border-primary bg-primary/10 ring-1 ring-primary"
                                )}
                              >
                                <RadioGroupItem
                                  value="PEREMPUAN"
                                  className="sr-only"
                                />
                                <span className="text-sm font-medium">
                                  Perempuan
                                </span>
                              </label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tempat & Tanggal Lahir (Digabung 1 baris) */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="placeOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                              Tempat Lahir
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Kota"
                                className="h-9 text-sm"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                              Tgl Lahir{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "h-9 w-full pl-3 text-left font-normal text-sm",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isPending}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy")
                                    ) : (
                                      <span>Pilih</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  captionLayout="dropdown"
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* --- KARTU KANAN: ORANG TUA & ALAMAT (Digabung) --- */}
                <Card className="shadow-sm border-border/60 flex flex-col h-full overflow-hidden">
                  <CardHeader className="pb-3 pt-4 px-5 bg-muted/20 border-b flex-none">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-primary">
                      <MapPinHouse className="w-4 h-4" /> Data Orang Tua &
                      Domisili
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 flex-1 overflow-y-auto">
                    {/* Nama Ortu & HP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                              Nama Orang Tua{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ayah / Ibu"
                                className="h-9 text-sm"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                              No. HP / WA
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="08..."
                                className="h-9 text-sm"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t my-2" />

                    {/* Wilayah (Digabung 1 baris) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="districtId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                              Kecamatan{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <div className="h-9">
                              <DistrictCombobox
                                value={field.value ?? ""}
                                onChange={(id, name) => {
                                  field.onChange(id); // Update field utama (districtId)
                                  handleDistrictChange(id, name); // Update districtName via helper
                                }}
                                disabled={isPending}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="villageId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                              Kelurahan/Desa{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <div className="h-9">
                              <VillageCombobox
                                districtId={selectedDistrict}
                                value={field.value ?? ""}
                                onChange={(id, name) => {
                                  field.onChange(id); // Update field utama (villageId)
                                  handleVillageChange(id, name); // Update villageName via helper
                                }}
                                disabled={isPending || !selectedDistrict}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Alamat Lengkap */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col">
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                            Alamat Detail
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Jalan, RT/RW, Patokan rumah..."
                              className="min-h-25 text-sm resize-none flex-1"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-right">
                            *Wajib diisi lengkap
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* 3. FOOTER ACTIONS (Fixed) */}
          <div className="flex-none p-4 border-t bg-background flex items-center justify-between z-10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-4 w-4" /> Batal
            </Button>

            <Button
              type="submit"
              disabled={!form.formState.isValid || isPending}
              className="min-w-37.5 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Proses...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {id ? "Simpan Perubahan" : "Simpan Data"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
