import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatientDetailHistory } from "@/app/actions/riwayat-imunisasi";
import ProfileHeader from "./clients/ProfileHeader";
import TimelineView from "./clients/TimeLineView";
import VaccineMatrix from "./clients/VaccineMatrix";

// Placeholder Components (Nanti kita buat file aslinya)

interface PageProps {
  // Pastikan params adalah Promise
  params: Promise<{
    patientId: string;
  }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.patientId;
  // 1. Fetch Data
  const data = await getPatientDetailHistory(id);

  // 2. Handle Not Found
  if (!data) {
    notFound();
  }

  const { patient, masterVaccines } = data;

  return (
    <div className="flex flex-col p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* --- Breadcrumb --- */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard"
              className="flex items-center gap-1"
            >
              <Home className="h-3 w-3" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/riwayat-imunisasi">
              Riwayat Imunisasi
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-primary">
              {patient.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- Bagian 1: Header Profil Pasien --- */}
      <ProfileHeader patient={patient} />

      {/* --- Bagian 2: Tab Navigasi (Timeline vs Matrix) --- */}
      <Tabs defaultValue="timeline" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="timeline">Kronologi (Timeline)</TabsTrigger>
            <TabsTrigger value="matrix">Tabel Kelengkapan</TabsTrigger>
          </TabsList>
        </div>

        {/* Content Tab 1: Timeline View */}
        <TabsContent value="timeline" className="mt-0">
          <div className="border rounded-xl bg-white p-6 min-h-[500px]">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              Jejak Rekam Kunjungan
            </h3>
            <TimelineView
              histories={patient.vaccineHistories}
              records={patient.immunizationRecords}
            />
          </div>
        </TabsContent>

        {/* Content Tab 2: Matrix View */}
        <TabsContent value="matrix" className="mt-0">
          <div className="border rounded-xl bg-white p-6 min-h-[500px]">
            <h3 className="text-lg font-semibold mb-2">
              Matriks Kelengkapan Vaksin
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Status kelengkapan berdasarkan jenis vaksin dan usia anak saat
              ini.
            </p>
            <VaccineMatrix
              histories={patient.vaccineHistories}
              masterVaccines={masterVaccines}
              ageMonths={patient.ageMonths}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
