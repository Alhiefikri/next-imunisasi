"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { router } from "better-auth/api";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function CellActions({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  return (
    <>
      <div className="flex justify-end gap-6">
        <div
          className="cursor-pointer"
          title="Edit"
          onClick={() => {
            router.push(`/pasien/${id}`);
          }}
        >
          <Edit />
        </div>
        <div
          className="cursor-pointer"
          title="Delete"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash />
        </div>
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent
            className="sm:max-w-106.25 flex flex-col gap-6"
            aria-description="Delete Patient"
            aria-describedby="patient"
          >
            <DialogHeader className="gap-6">
              <DialogTitle>Delete Patient</DialogTitle>
              <DialogDescription className="flex flex-col">
                <span className="text-md">
                  Are you sure you want to delete this patient?{" "}
                  <span className="font-semibold">
                    This action cannot be undone.
                  </span>
                </span>
              </DialogDescription>
            </DialogHeader>

            <Button
              variant="destructive"
              className="max-w-40 self-end cursor-pointer"
            >
              {isLoading ? <Spinner className="size-6" /> : "Delete Patient"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
