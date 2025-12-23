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
import { useVaccine } from "@/hooks/use-vaccines";
import { Vaccine } from "@/lib/generated/prisma/client";
import { VaccineFormSchema, VaccineFormValues } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createVaccine, updateVaccine } from "@/app/actions/vaccines";
import { toast } from "sonner";

export default function VaccinesClient({ vaccines }: { vaccines: Vaccine[] }) {
  const form = useForm({
    resolver: zodResolver(VaccineFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  const { open, setOpen, vaccine, setVaccine } = useVaccine();

  const router = useRouter();

  useEffect(() => {
    if (vaccine) {
      form.setValue("name", vaccine.name);
    }
  }, [vaccine]);

  const onSubmit = async (data: VaccineFormValues) => {
    try {
      if (vaccine?.id) {
        await updateVaccine({
          id: vaccine.id,
          name: data.name,
          description: data.description || "",
        });
        toast.success("Vaccine updated successfully.");
      } else {
        await createVaccine(data.name, data.description || "");
        toast.success("Vaccine created successfully.");
      }
      router.refresh();
      form.reset();
      setVaccine({ id: "", name: "", description: "" });
      setOpen(false);
    } catch (error) {
      console.error("Error submitting vaccine form:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="vaccine-form">
            <DialogContent className="sm:w-106.25">
              <DialogHeader>
                <DialogTitle>Edit Vaccine</DialogTitle>
              </DialogHeader>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Vaccine Name" />
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
                    <FormControl>
                      <Input {...field} placeholder="Vaccine Description" />
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
            Create a New Vaccine
          </Button>
        </div>

        <div className="p-8 flex flex-col">
          <DataTable data={vaccines} columns={columns} />
        </div>
      </div>
    </>
  );
}
