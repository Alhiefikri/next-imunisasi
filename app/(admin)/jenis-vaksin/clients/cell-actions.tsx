import { removeVaccine } from "@/app/actions/vaccines";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useVaccine, VaccineProps } from "@/hooks/use-vaccines";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CellActions({ id, name, description }: VaccineProps) {
  const { setVaccine, setOpen } = useVaccine();
  const [isLoading, setIsloading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const onRemoveVaccine = async () => {
    try {
      setIsloading(true);
      await removeVaccine(id);
    } catch (error) {
      console.error("Error deleting vaccine:", error);
    } finally {
      router.refresh();
      setIsloading(false);
      setIsDeleteModalOpen(false);
      toast.success(`Vaccine ${name} deleted successfully.`);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-6">
        <div
          className="cursor-pointer"
          title="Edit"
          onClick={() => {
            setOpen(true);
            setVaccine({ id, name, description });
          }}
        >
          <Edit />
        </div>
        <div
          className="cursor-pointer"
          title="Delete"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash className="text-red-500" />
        </div>
      </div>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent
          className="sm:max-w-106.25 flex flex-col gap-6"
          aria-describedby="vaccine"
          aria-description="delete vaccine"
        >
          <DialogHeader className="gap-6">
            <DialogTitle>Delete Vaccine</DialogTitle>
            <DialogDescription className="flex flex-col">
              <span className="text-md">
                Are you sure you want to delete this vaccine {name}?
                <span>This action cannot be undone.</span>
              </span>
            </DialogDescription>
          </DialogHeader>

          <Button
            variant="destructive"
            className="max-w-40 self-end cursor-pointer"
            disabled={isLoading}
            onClick={onRemoveVaccine}
          >
            {isLoading ? <Spinner className="size-6" /> : "Delete"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
