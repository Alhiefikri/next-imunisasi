import { removePosyandu } from "@/app/actions/posyandu";
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
import { PosyanduProps, usePosyandu } from "@/hooks/use-posyandu";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CellActions({
  id,
  name,
  address,
  districtId,
  districtName,
  villageId,
  villageName,
}: PosyanduProps) {
  const { setPosyandu, setOpen } = usePosyandu();
  const [isLoading, setIsloading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const onRemovePosyandu = async () => {
    try {
      setIsloading(true);
      await removePosyandu(id);
    } catch (error) {
      console.error("Error deleting posyandu:", error);
    } finally {
      router.refresh();
      setIsloading(false);
      setIsDeleteModalOpen(false);
      toast.success(`Posyandu ${name} deleted successfully.`);
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
            setPosyandu({
              id,
              name,
              address,
              districtId,
              districtName,
              villageId,
              villageName,
            });
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
            <DialogTitle>Delete Posyandu</DialogTitle>
            <DialogDescription className="flex flex-col">
              <span className="text-md">
                Are you sure you want to delete this posyandu {name}?
                <span>This action cannot be undone.</span>
              </span>
            </DialogDescription>
          </DialogHeader>

          <Button
            variant="destructive"
            className="max-w-40 self-end cursor-pointer"
            disabled={isLoading}
            onClick={onRemovePosyandu}
          >
            {isLoading ? <Spinner className="size-6" /> : "Delete"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
