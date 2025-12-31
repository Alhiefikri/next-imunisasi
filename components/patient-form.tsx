"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarIcon,
  Save,
  Loader2,
  X,
  User,
  MapPin,
  Baby,
  Contact,
  Smartphone,
  Home,
  UserCircle,
  Mail,
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
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { PatientformSchema, PatientFormValues } from "@/lib/zod";
import { createPatient, updatePatient } from "@/app/actions/patiens";
import { VillageCombobox } from "./wilayah/VillageCombobox";
import { Textarea } from "./ui/textarea";
import { DistrictCombobox } from "./wilayah/DistrictCombobox";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

export default function PatientForm({
  id,
  name,
  nik,
  birthDate,
  gender,
  placeOfBirth,
  motherName,
  nikmother,
  fatherName,
  nikfather,
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
      motherName: motherName || "",
      nikmother: nikmother || "",
      fatherName: fatherName || "",
      nikfather: nikfather || "",
      phoneNumber: phoneNumber || "",
      districtId: districtId || undefined,
      districtName: districtName || undefined,
      villageId: villageId || undefined,
      villageName: villageName || undefined,
      address: address || "",
    },
  });

  // Watcher untuk District agar Village Combobox reaktif
  const districtValue = form.watch("districtId");
  useEffect(() => {
    if (districtValue) setSelectedDistrict(districtValue);
  }, [districtValue]);

  // Handle Perubahan Wilayah
  const handleDistrictChange = (id: string, name: string) => {
    form.setValue("districtId", id);
    form.setValue("districtName", name);
    form.setValue("villageId", "");
    form.setValue("villageName", "");
  };

  const handleVillageChange = (id: string, name: string) => {
    form.setValue("villageId", id);
    form.setValue("villageName", name);
  };

  // Submit Handler
  const onSubmit = async (values: PatientFormValues) => {
    startTransition(async () => {
      try {
        const result = id
          ? await updatePatient(values)
          : await createPatient(values);

        if (!result.success) {
          if (result.code === "DUPLICATE_ENTRY" && result.error) {
            let fieldName: any = "nik";
            if (result.error.includes("Ibu")) fieldName = "nikmother";
            if (result.error.includes("Ayah")) fieldName = "nikfather";

            form.setError(fieldName, { message: result.error });
            toast.error("Data Duplikat", { description: result.error });
          } else {
            toast.error("Gagal Menyimpan", { description: result.error });
          }
          return;
        }

        toast.success(id ? "Data Diperbarui" : "Pasien Terdaftar");
        if (!id) form.reset();

        setTimeout(() => {
          router.push("/pasien");
          router.refresh();
        }, 500);
      } catch (error) {
        toast.error("Terjadi Kesalahan", { description: "Silakan coba lagi." });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 md:p-4 lg:p-6">
      {/* Header dengan judul yang menarik */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {id ? "📝 Edit Data Pasien" : "👶 Pendaftaran Pasien Baru"}
            </h1>
            <p className="text-slate-600 mt-2 max-w-3xl">
              {id
                ? "Perbarui data pasien dengan informasi terbaru"
                : "Lengkapi formulir di bawah untuk mendaftarkan pasien baru ke sistem imunisasi"}
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-sm px-4 py-2 bg-white/80 backdrop-blur-sm border-slate-200"
          >
            {id ? "Mode Edit" : "Mode Tambah Baru"}
          </Badge>
        </div>
      </div>

      {/* Progress indicator (opsional) */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-center gap-2">
          {["Data Pasien", "Orang Tua", "Alamat"].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index === 0
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {index + 1}
                </div>
                <span className="hidden md:inline text-sm font-medium text-slate-700">
                  {step}
                </span>
              </div>
              {index < 2 && <div className="w-8 h-0.5 bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-7xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* LEFT COLUMN: Data Pasien */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Baby className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">
                        Identitas Pasien
                      </CardTitle>
                      <p className="text-blue-100 text-sm mt-1">
                        Data pribadi dan informasi kelahiran
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Nama Lengkap */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2 mb-2">
                          <UserCircle className="w-4 h-4 text-blue-500" />
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Nama Lengkap Pasien
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Masukkan nama lengkap sesuai KK"
                            className="h-12 px-4 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Grid untuk NIK dan Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Nomor Induk Kependudukan (NIK)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="16 digit NIK"
                              maxLength={16}
                              className="h-12 font-mono tracking-wider border-slate-300"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-slate-500 mt-1">
                            * Opsional untuk bayi baru lahir
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Jenis Kelamin
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-4 pt-2"
                              disabled={isPending}
                            >
                              <div className="flex-1">
                                <RadioGroupItem
                                  value="LAKI_LAKI"
                                  id="male"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="male"
                                  className={cn(
                                    "flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200",
                                    field.value === "LAKI_LAKI"
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                  )}
                                >
                                  <span className="text-2xl mb-2">👦</span>
                                  <span className="font-medium">Laki-laki</span>
                                </label>
                              </div>
                              <div className="flex-1">
                                <RadioGroupItem
                                  value="PEREMPUAN"
                                  id="female"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="female"
                                  className={cn(
                                    "flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200",
                                    field.value === "PEREMPUAN"
                                      ? "border-pink-500 bg-pink-50"
                                      : "border-slate-200 hover:border-pink-300 hover:bg-slate-50"
                                  )}
                                >
                                  <span className="text-2xl mb-2">👧</span>
                                  <span className="font-medium">Perempuan</span>
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Grid untuk Tempat dan Tanggal Lahir */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="placeOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Tempat Lahir
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Kota/Tempat lahir"
                              className="h-12 border-slate-300"
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
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Tanggal Lahir
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-12 justify-start text-left font-normal border-slate-300 hover:border-blue-500",
                                    !field.value && "text-slate-400"
                                  )}
                                  disabled={isPending}
                                >
                                  <CalendarIcon className="mr-3 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "dd MMMM yyyy", {
                                      locale: idLocale,
                                    })
                                  ) : (
                                    <span>Pilih tanggal lahir</span>
                                  )}
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
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                                className="rounded-md border"
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

              {/* RIGHT COLUMN: Orang Tua dan Alamat */}
              <div className="space-y-6 md:space-y-8">
                {/* Card Data Orang Tua */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Contact className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">
                          Data Orang Tua
                        </CardTitle>
                        <p className="text-emerald-100 text-sm mt-1">
                          Informasi ayah dan ibu pasien
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Ibu */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <User className="w-4 h-4 text-pink-600" />
                        </div>
                        <h3 className="font-semibold text-slate-700">Ibu</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="motherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-600">
                                Nama Lengkap Ibu
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nama ibu kandung"
                                  className="border-slate-300"
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nikmother"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-600">
                                NIK Ibu
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="16 digit NIK ibu"
                                  maxLength={16}
                                  className="font-mono tracking-wider border-slate-300"
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Ayah */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-700">Ayah</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fatherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-600">
                                Nama Lengkap Ayah
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nama ayah kandung"
                                  className="border-slate-300"
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nikfather"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-600">
                                NIK Ayah
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="16 digit NIK ayah"
                                  maxLength={16}
                                  className="font-mono tracking-wider border-slate-300"
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Kontak */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="w-4 h-4 text-emerald-500" />
                            <FormLabel className="text-sm font-semibold text-slate-700">
                              Nomor Telepon/WhatsApp
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="08xxxxxxxxxx"
                              className="h-12 border-slate-300"
                              disabled={isPending}
                            />
                          </FormControl>
                          <p className="text-xs text-slate-500 mt-1">
                            * Digunakan untuk notifikasi dan konfirmasi
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Card Alamat */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-violet-500 to-violet-600 text-white p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Home className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">
                          Alamat Domisili
                        </CardTitle>
                        <p className="text-violet-100 text-sm mt-1">
                          Lokasi tempat tinggal pasien
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="districtId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-700">
                              Kecamatan
                            </FormLabel>
                            <DistrictCombobox
                              value={field.value ?? ""}
                              onChange={(id, name) => {
                                field.onChange(id);
                                handleDistrictChange(id, name);
                              }}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="villageId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-700">
                              Desa/Kelurahan
                            </FormLabel>
                            <VillageCombobox
                              districtId={selectedDistrict}
                              value={field.value ?? ""}
                              onChange={(id, name) => {
                                field.onChange(id);
                                handleVillageChange(id, name);
                              }}
                              disabled={!selectedDistrict}
                            />
                            {!selectedDistrict && (
                              <p className="text-xs text-amber-600 mt-1">
                                Pilih kecamatan terlebih dahulu
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Alamat Lengkap
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Jalan, RT/RW, Nomor Rumah, Blok, dll."
                              className="min-h-[100px] resize-y border-slate-300 focus:border-violet-500"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="max-w-7xl mx-auto mt-8 md:mt-12">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Siap menyimpan data?
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Pastikan semua data sudah benar sebelum disimpan
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isPending}
                      className="h-12 px-8 border-slate-300 hover:bg-slate-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Batal
                    </Button>

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-12 px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan Data...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {id ? "Simpan Perubahan" : "Simpan Data Pasien"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Wajib diisi</span>
                    </div>
                    <div className="hidden md:block">•</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span>Data orang tua</span>
                    </div>
                    <div className="hidden md:block">•</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                      <span>Informasi alamat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
