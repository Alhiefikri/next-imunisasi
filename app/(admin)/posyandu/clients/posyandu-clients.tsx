"use client";

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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Posyandu, Vaccine } from "@/lib/generated/prisma/client";
import { PosyanduFormSchema, PosyanduFormValues } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { usePosyandu } from "@/hooks/use-posyandu";
import { DistrictCombobox } from "@/components/wilayah/DistrictCombobox";
import { VillageCombobox } from "@/components/wilayah/VillageCombobox";
import { Textarea } from "@/components/ui/textarea";
import { createPosyandu, updatePosyandu } from "@/app/actions/posyandu";
import { toast } from "sonner";

export default function PosyanduClients({
  posyanduList,
}: {
  posyanduList: Posyandu[];
}) {
  const { open, setOpen, posyandu, setPosyandu } = usePosyandu();
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(PosyanduFormSchema),
    defaultValues: {
      name: "",
      address: "",
      districtId: "",
      districtName: "",
      villageId: "",
      villageName: "",
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

  useEffect(() => {
    if (posyandu) {
      form.setValue("name", posyandu.name);
      form.setValue("address", posyandu.address);
      form.setValue("districtId", posyandu.districtId!);
      form.setValue("districtName", posyandu.districtName!);
      form.setValue("villageId", posyandu.villageId!);
      form.setValue("villageName", posyandu.villageName!);
    }
  }, [posyandu]);

  const onSubmit = async (data: PosyanduFormValues) => {
    try {
      if (posyandu?.id) {
        await updatePosyandu({
          id: posyandu.id,
          name: data.name,
          address: data.address,
          districtId: data.districtId,
          villageId: data.villageId,
          districtName: data.districtName,
          villageName: data.villageName,
        });
        toast.success("Posyandu updated successfully.");
      } else {
        await createPosyandu(
          data.name,
          data.address,
          data.districtId!,
          data.villageId!,
          data.districtName!,
          data.villageName!
        );
        toast.success("Posyandu created successfully.");
      }
      router.refresh();
      form.reset();
      setPosyandu({
        id: "",
        name: "",
        address: "",
        districtId: "",
        villageId: "",
        districtName: "",
        villageName: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error submitting vaccine form:", error);
      toast.error("An error occurred. Please try again.");
    }
  };
  const handleVillageChange = (id: string, name: string) => {
    form.setValue("villageId", id);
    form.setValue("villageName", name); // Simpan Nama Kelurahan
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Form {...form}>
          <form id="vaccine-form" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogContent className="sm:w-106.25">
              <DialogHeader>
                <DialogTitle>
                  {posyandu ? "Edit Posyandu" : "Create Posyandu"}
                </DialogTitle>
              </DialogHeader>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Posyandu Name" />
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
                    <FormControl>
                      <DistrictCombobox
                        value={field.value ?? ""}
                        onChange={(id, name) => {
                          field.onChange(id); // Update field utama (districtId)
                          handleDistrictChange(id, name); // Update districtName via helper
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
                    <FormControl>
                      <VillageCombobox
                        districtId={selectedDistrict}
                        value={field.value ?? ""}
                        onChange={(id, name) => {
                          field.onChange(id); // Update field utama (villageId)
                          handleVillageChange(id, name); // Update villageName via helper
                        }}
                        disabled={!selectedDistrict}
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
                    <FormControl>
                      <Textarea {...field} placeholder="Masukan Alamat" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="cursor-pointer"
                form="vaccine-form"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? (
                  <Spinner className="size-6" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogContent>
          </form>
        </Form>
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

          <Button className="cursor-pointer" onClick={() => setOpen(true)}>
            Create a New Posyandu
          </Button>
        </div>

        <div className="p-8 flex flex-col">
          <DataTable data={posyanduList} columns={columns} />
        </div>
      </div>
    </>
  );
}
