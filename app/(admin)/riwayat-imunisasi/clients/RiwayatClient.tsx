"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PatientCard from "./PatientCard";

type PatientWithStatus = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  motherName: string | null;
  nik: string | null;
  age: { months: number; display: string };
  vaccination: {
    given: number;
    total: number;
    progress: number;
    status: "on-track" | "warning" | "behind" | "completed";
  };
  lastVisit: string | null;
  lastVisitStatus: "SERVED" | "CANCELLED" | "WAITING";
  lastVisitNotes?: string | null;
};

interface RiwayatClientProps {
  patients: PatientWithStatus[];
}

export default function RiwayatClient({ patients }: RiwayatClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const matchSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.motherName?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || patient.vaccination.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama anak atau nama ibu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="on-track">Sesuai Jadwal</SelectItem>
            <SelectItem value="warning">Perlu Perhatian</SelectItem>
            <SelectItem value="behind">Terlambat</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Anak" value={patients.length} color="blue" />
        <StatCard
          label="Sesuai Jadwal"
          value={
            patients.filter((p) => p.vaccination.status === "on-track").length
          }
          color="green"
        />
        <StatCard
          label="Perlu Perhatian"
          value={
            patients.filter((p) => p.vaccination.status === "warning").length
          }
          color="amber"
        />
        <StatCard
          label="Terlambat"
          value={
            patients.filter((p) => p.vaccination.status === "behind").length
          }
          color="red"
        />
      </div>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Tidak ada data yang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    red: "bg-rose-50 text-rose-600 border-rose-200",
  };

  return (
    <div
      className={`rounded-lg border p-4 ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
