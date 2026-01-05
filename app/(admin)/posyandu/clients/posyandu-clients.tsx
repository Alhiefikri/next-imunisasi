"use client";

import { useEffect, useState, useTransition } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DistrictCombobox } from "@/components/wilayah/DistrictCombobox";
import { VillageCombobox } from "@/components/wilayah/VillageCombobox";
import { Spinner } from "@/components/ui/spinner";

import { usePosyandu } from "@/hooks/use-posyandu";
import {
  PosyanduFormInput,
  PosyanduFormSchema,
  type PosyanduFormValues,
} from "@/lib/zod";
import { createPosyandu, updatePosyandu } from "@/app/actions/posyandu";
import type { Posyandu } from "@/lib/generated/prisma/client";
import { columns } from "./columns";

export default function PosyanduClients({
  posyanduList,
}: {
  posyanduList: Posyandu[];
}) {
  const { open, setOpen, posyandu, setPosyandu } = usePosyandu();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const form = useForm<PosyanduFormInput>({
    resolver: zodResolver(PosyanduFormSchema),
    defaultValues: {
      name: "",
      address: "",
      districtId: "", // ✅ Empty string, bukan undefined
      districtName: "",
      villageId: "",
      villageName: "",
    },
  });

  const districtValue = form.watch("districtId");

  useEffect(() => {
    if (districtValue) setSelectedDistrict(districtValue);
  }, [districtValue]);

  useEffect(() => {
    if (posyandu) {
      form.reset({
        name: posyandu.name,
        address: posyandu.address,
        districtId: posyandu.districtId ?? "", // Pakai "" jangan undefined/null
        districtName: posyandu.districtName ?? "",
        villageId: posyandu.villageId ?? "",
        villageName: posyandu.villageName ?? "",
      });
      setSelectedDistrict(posyandu.districtId ?? "");
    } else {
      form.reset({
        name: "",
        address: "",
        districtId: "",
        districtName: "",
        villageId: "",
        villageName: "",
      });
      setSelectedDistrict("");
    }
  }, [posyandu, form]);

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

  const onSubmit = (data: PosyanduFormInput) => {
    startTransition(async () => {
      try {
        if (posyandu?.id) {
          await updatePosyandu(posyandu.id, data as any);
          toast.success("Posyandu diperbarui");
        } else {
          await createPosyandu(data as any);
          toast.success("Posyandu berhasil dibuat");
        }

        router.refresh();
        form.reset();
        setPosyandu(null);
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
    setPosyandu(null);
    setSelectedDistrict("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {posyandu ? "Edit Posyandu" : "Tambah Posyandu"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Posyandu *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nama posyandu"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Alamat lengkap posyandu"
                        rows={3}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan</FormLabel>
                    <FormControl>
                      <DistrictCombobox
                        value={field.value ?? ""}
                        onChange={(id, name) => {
                          field.onChange(id);
                          handleDistrictChange(id, name);
                        }}
                      />
                    </FormControl>
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
                    <FormControl>
                      <VillageCombobox
                        districtId={selectedDistrict}
                        value={field.value ?? ""}
                        onChange={(id, name) => {
                          field.onChange(id);
                          handleVillageChange(id, name);
                        }}
                        disabled={!selectedDistrict || isPending}
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
        <div className="flex w-full justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Posyandu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button onClick={() => setOpen(true)}>Tambah Posyandu</Button>
        </div>

        <div className="p-8">
          <DataTable data={posyanduList} columns={columns} />
        </div>
      </div>
    </>
  );
}
