import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";

interface PosyanduItem {
  id: string;
  name: string;
  villageName: string;
}

interface PosyanduComboBoxProps {
  items: PosyanduItem[];
  value: string;
  onSelect: (value: string) => void;
}

export default function PosyanduComboBox({
  items,
  value,
  onSelect,
}: PosyanduComboBoxProps) {
  const [open, setOpen] = useState(false);

  // mencari item yang terpilih untuk di tampilkan di tombol
  const selectedItem = items.find((item) => item.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 textsm font-normal"
        >
          {selectedItem ? (
            <span className="truncate">
              {selectedItem.name} ({selectedItem.villageName})
            </span>
          ) : (
            <span className="text-muted-foreground">
              Pilih lokasi posyandu...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Cari nama posyandu atau desa..." />
          <CommandList>
            <CommandEmpty>Posyandu tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  // value untuk pencarian (gabungan nama + desa)
                  value={`${item.name} ${item.villageName}`}
                  onSelect={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Desa/Kel : {item.villageName}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
