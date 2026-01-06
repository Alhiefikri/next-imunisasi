// app/pasien/_components/patient-filters.tsx
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  getDistrictsWithPatients,
  getVillagesByDistrict,
} from "@/app/actions/patiens";

export function PatientFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [ageMin, setAgeMin] = useState(searchParams.get("ageMin") || "");
  const [ageMax, setAgeMax] = useState(searchParams.get("ageMax") || "");
  const [districtId, setDistrictId] = useState(
    searchParams.get("districtId") || ""
  );
  const [villageId, setVillageId] = useState(
    searchParams.get("villageId") || ""
  );
  const [vaccinationStatus, setVaccinationStatus] = useState(
    searchParams.get("vaccinationStatus") || ""
  );

  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );
  const [villages, setVillages] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getDistrictsWithPatients().then(setDistricts);
  }, []);

  useEffect(() => {
    if (districtId) {
      getVillagesByDistrict(districtId).then(setVillages);
    } else {
      setVillages([]);
      setVillageId("");
    }
  }, [districtId]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (gender) params.set("gender", gender);
    if (ageMin) params.set("ageMin", ageMin);
    if (ageMax) params.set("ageMax", ageMax);
    if (districtId) params.set("districtId", districtId);
    if (villageId) params.set("villageId", villageId);
    if (vaccinationStatus) params.set("vaccinationStatus", vaccinationStatus);

    startTransition(() => {
      router.push(`/pasien?${params.toString()}`);
    });
  };

  const resetFilters = () => {
    setSearch("");
    setGender("");
    setAgeMin("");
    setAgeMax("");
    setDistrictId("");
    setVillageId("");
    setVaccinationStatus("");
    startTransition(() => {
      router.push("/pasien");
    });
  };

  const activeFiltersCount = [
    gender,
    ageMin,
    ageMax,
    districtId,
    villageId,
    vaccinationStatus,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIK, nama orang tua, atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="pl-9"
          />
        </div>
        <Button onClick={applyFilters} disabled={isPending}>
          <Search className="h-4 w-4 mr-2" />
          Cari
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Jenis Kelamin
                </label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Usia (Bulan)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Kecamatan
                </label>
                <Select value={districtId} onValueChange={setDistrictId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {districtId && villages.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Kelurahan
                  </label>
                  <Select value={villageId} onValueChange={setVillageId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelurahan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {villages.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Status Vaksinasi
                </label>
                <Select
                  value={vaccinationStatus}
                  onValueChange={setVaccinationStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="completed">Lengkap</SelectItem>
                    <SelectItem value="on-track">Sesuai Jadwal</SelectItem>
                    <SelectItem value="behind">Tertinggal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={applyFilters} className="flex-1">
                  Terapkan
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Hapus Filter
          </Button>
        )}
      </div>
    </div>
  );
}
