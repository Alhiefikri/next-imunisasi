"use client";

import { useRouter } from "next/navigation";
import React from "react";
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
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { createPatient } from "@/app/actions/patiens";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientformSchema, PatientFormValues } from "@/lib/zod";

export default function PatientForm({
  id,
  name,
  nik,
  birthDate,
  gender,
}: Partial<PatientFormValues>) {
  const router = useRouter();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientformSchema),
    defaultValues: {
      id: id || undefined,
      name: name || "",
      nik: nik || "",
      birthDate: birthDate || undefined,
      gender: gender || undefined,
    },
    mode: "onChange", // Ubah dari onBlur ke onChange untuk validasi realtime
  });

  const onSubmit = async (data: PatientFormValues) => {
    try {
      if (id) {
        // await updatePatient(data);
        toast.success("Pasien berhasil diperbarui");
      } else {
        const result = await createPatient(data);

        if (!result.success) {
          if (result.code === "DUPLICATE_NIK") {
            toast.error("NIK sudah terdaftar!", {
              description: "Silakan gunakan NIK yang berbeda.",
            });
          } else {
            toast.error(result.error || "Terjadi kesalahan");
          }
          return;
        }

        toast.success("Pasien berhasil ditambahkan");
      }

      router.refresh();
      router.push("/pasien");
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        className="grid grid-cols-2 gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-6 py-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan nama lengkap" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Masukkan 16 digit NIK"
                    maxLength={16}
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
                      >
                        {field.value
                          ? format(field.value, "dd MMMM yyyy")
                          : "Pilih tanggal"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
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
                    className="flex gap-6"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="LAKI_LAKI" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Laki-laki
                      </FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="PEREMPUAN" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Perempuan
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="max-w-40 cursor-pointer"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Spinner className="size-6" />
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
