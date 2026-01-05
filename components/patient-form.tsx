"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarIcon, Save, Loader2, X } from "lucide-react";
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
import { Textarea } from "./ui/textarea";
import { VillageCombobox } from "./wilayah/VillageCombobox";
import { DistrictCombobox } from "./wilayah/DistrictCombobox";

import { cn } from "@/lib/utils";
import {
  PatientFormInput,
  PatientFormSchema,
  type PatientFormValues,
} from "@/lib/zod";
import { createPatient, updatePatient } from "@/app/actions/patiens";

interface PatientFormProps {
  initialData?: Partial<PatientFormValues>;
  patientId?: string;
}

export default function PatientForm({
  initialData,
  patientId,
}: PatientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialData?.districtId ?? ""
  );
  const form = useForm<PatientFormInput>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      nik: initialData?.nik ?? undefined,
      birthDate: initialData?.birthDate
        ? new Date(initialData.birthDate)
        : new Date(),
      gender: initialData?.gender ?? "LAKI_LAKI",
      placeOfBirth: initialData?.placeOfBirth ?? "",
      motherName: initialData?.motherName ?? "",
      nikmother: initialData?.nikmother ?? "",
      fatherName: initialData?.fatherName ?? "",
      nikfather: initialData?.nikfather ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      districtId: initialData?.districtId ?? "",
      districtName: initialData?.districtName ?? "",
      villageId: initialData?.villageId ?? "",
      villageName: initialData?.villageName ?? "",
      address: initialData?.address ?? "",
    },
  });

  const districtValue = form.watch("districtId");

  useEffect(() => {
    if (districtValue) setSelectedDistrict(districtValue);
  }, [districtValue]);

  const handleDistrictChange = (id: string, name: string) => {
    form.setValue("districtId", id);
    form.setValue("districtName", name);
    form.setValue("villageId", undefined);
    form.setValue("villageName", undefined);
  };

  const handleVillageChange = (id: string, name: string) => {
    form.setValue("villageId", id);
    form.setValue("villageName", name);
  };

  const onSubmit = (values: PatientFormInput) => {
    startTransition(async () => {
      try {
        if (patientId) {
          // Casting ke any atau unknown sebelum masuk ke action
          // agar tidak konflik tipe di sisi Client
          await updatePatient(patientId, values as any);
          toast.success("Data berhasil diperbarui");
        } else {
          await createPatient(values as any);
          toast.success("Pasien berhasil terdaftar");
          form.reset();
        }

        router.push("/pasien");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Terjadi kesalahan";

        // Set form error jika NIK duplicate
        if (message.includes("NIK anak")) {
          form.setError("nik", { message });
        } else if (message.includes("NIK ibu")) {
          form.setError("nikmother", { message });
        } else if (message.includes("NIK ayah")) {
          form.setError("nikfather", { message });
        }

        toast.error(message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {patientId ? "Edit Data Pasien" : "Pendaftaran Pasien Baru"}
          </h1>
          <p className="text-slate-600 mt-2">
            {patientId
              ? "Perbarui data pasien dengan informasi terbaru"
              : "Lengkapi formulir untuk mendaftarkan pasien baru"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Data Pasien */}
            <section className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Identitas Pasien
              </h2>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nama lengkap sesuai KK"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="16 digit"
                          maxLength={16}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          disabled={isPending}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="LAKI_LAKI" id="laki" />
                            <label htmlFor="laki" className="cursor-pointer">
                              Laki-laki
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PEREMPUAN" id="perempuan" />
                            <label
                              htmlFor="perempuan"
                              className="cursor-pointer"
                            >
                              Perempuan
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempat Lahir</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Kota/Kabupaten"
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
                      <FormLabel>Tanggal Lahir *</FormLabel>
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
                                format(field.value as Date, "dd MMMM yyyy", {
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
                            selected={field.value as any}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Data Orang Tua */}
            <section className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Data Orang Tua
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Ibu</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nama ibu kandung"
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
                      <FormLabel>NIK Ibu</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="16 digit"
                          maxLength={16}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Ayah</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nama ayah kandung"
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
                      <FormLabel>NIK Ayah</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="16 digit"
                          maxLength={16}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="08xxxxxxxxxx"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Alamat */}
            <section className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              <h2 className="text-xl font-semibold text-slate-800">Alamat</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="districtId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kecamatan</FormLabel>
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
                      <FormLabel>Desa/Kelurahan</FormLabel>
                      <VillageCombobox
                        districtId={selectedDistrict}
                        value={field.value ?? ""}
                        onChange={(id, name) => {
                          field.onChange(id);
                          handleVillageChange(id, name);
                        }}
                        disabled={!selectedDistrict}
                      />
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
                    <FormLabel>Alamat Lengkap</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Jalan, RT/RW, No. Rumah"
                        rows={3}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {patientId ? "Update" : "Simpan"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
