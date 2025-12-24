// components/forms/VillageCombobox.tsx
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
import { fetchVillages } from "@/lib/api/wilayah";
import { useEffect, useState } from "react";

interface VillageComboboxProps {
  districtId: string;
  value: string;
  // ⭐ UBAH 1: onChange sekarang menerima id DAN name
  onChange: (id: string, name: string) => void;
  className?: string;
  disabled?: boolean;
}

export function VillageCombobox({
  districtId,
  value,
  onChange,
  className,
  disabled = false,
}: VillageComboboxProps) {
  const [open, setOpen] = useState(false);
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [debouncedDistrictId, setDebouncedDistrictId] = useState(districtId);

  // Debounce logic (tetap sama)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDistrictId(districtId);
    }, 300);

    return () => clearTimeout(timer);
  }, [districtId]);

  // Fetch logic
  useEffect(() => {
    async function loadVillages() {
      if (!debouncedDistrictId || disabled) {
        setVillages([]);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchVillages(debouncedDistrictId);
        setVillages(data);

        // ⭐ UBAH 2: Reset value jika kelurahan tidak valid lagi (kirim 2 param kosong)
        if (value && !data.find((v) => v.id === value)) {
          onChange("", "");
        }
      } catch (error) {
        console.error("Failed to load villages:", error);
        setVillages([]);
      } finally {
        setLoading(false);
      }
    }

    loadVillages();
  }, [debouncedDistrictId, onChange, value, disabled]);

  const selectedVillage = villages.find((village) => village.id === value);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={!districtId || disabled}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            <span className="truncate">
              {value && selectedVillage
                ? selectedVillage.name
                : districtId
                ? "Pilih kelurahan..."
                : "Pilih kecamatan terlebih dahulu"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command
            className="w-full"
            filter={(value, search) => {
              const item = villages.find((v) => v.id === value);
              return item &&
                item.name.toLowerCase().includes(search.toLowerCase())
                ? 1
                : 0;
            }}
          >
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Cari kelurahan..."
                className="h-11 border-0 focus:ring-0"
              />
            </div>
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memuat data kelurahan...
                  </div>
                ) : districtId ? (
                  "Kelurahan tidak ditemukan"
                ) : (
                  "Pilih kecamatan terlebih dahulu"
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-75 overflow-y-auto">
                {villages.map((village) => (
                  <CommandItem
                    key={village.id}
                    value={village.id}
                    // ⭐ UBAH 3: Logic onSelect untuk mengirim ID dan NAME
                    onSelect={(currentValue) => {
                      if (currentValue === value) {
                        // Jika diklik lagi (deselect), kosongkan keduanya
                        onChange("", "");
                      } else {
                        // Cari object lengkapnya untuk ambil name
                        const selected = villages.find(
                          (v) => v.id === currentValue
                        );
                        if (selected) {
                          onChange(selected.id, selected.name);
                        }
                      }
                      setOpen(false);
                    }}
                    className="cursor-pointer py-3"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === village.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{village.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Kode: {village.id}
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
