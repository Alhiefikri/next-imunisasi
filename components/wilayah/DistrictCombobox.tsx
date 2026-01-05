// components/forms/DistrictCombobox.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchDistricts } from "@/lib/api/wilayah";
import { useEffect, useState } from "react";

interface DistrictComboboxProps {
  value: string; // districtId
  onChange: (id: string, name: string) => void; // ⭐ Kirim id DAN name
  className?: string;
  disabled?: boolean;
}

export function DistrictCombobox({
  value,
  onChange,
  className,
  disabled = false,
}: DistrictComboboxProps) {
  const [open, setOpen] = useState(false);
  const [districts, setDistricts] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDistricts() {
      setLoading(true);
      try {
        const data = await fetchDistricts("7202"); // Metro Lampung
        setDistricts(data);
      } catch (error) {
        console.error("Failed to load districts:", error);
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    }

    loadDistricts();
  }, []);

  const selectedDistrict = districts.find((d) => d.id === value);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            <span className="truncate">
              {selectedDistrict ? selectedDistrict.name : "Pilih kecamatan..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command
            className="w-full"
            filter={(value, search) => {
              const item = districts.find((d) => d.id === value);
              return item &&
                item.name.toLowerCase().includes(search.toLowerCase())
                ? 1
                : 0;
            }}
          >
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Cari kecamatan..."
                className="h-11 border-0 focus:ring-0"
              />
            </div>
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memuat data kecamatan...
                  </div>
                ) : (
                  "Kecamatan tidak ditemukan"
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-75 overflow-y-auto">
                {districts.map((district) => (
                  <CommandItem
                    key={district.id}
                    value={district.id}
                    onSelect={(currentValue) => {
                      const selected = districts.find(
                        (d) => d.id === currentValue
                      );
                      if (selected) {
                        onChange(selected.id, selected.name); // ⭐ Kirim id & name
                      }
                      setOpen(false);
                    }}
                    className="cursor-pointer py-3"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === district.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{district.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Kode: {district.id}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
