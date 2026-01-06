// app/riwayat-imunisasi/page.tsx
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getPatientsWithVaccinationStatus } from "@/app/actions/riwayat-imunisasi";
import RiwayatClient from "./clients/RiwayatClient";

export default async function RiwayatPage() {
  return (
    <div className="flex flex-col p-8 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Riwayat Imunisasi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Riwayat Imunisasi</h1>
        <p className="text-muted-foreground mt-2">
          Lihat dan pantau progress vaksinasi setiap anak
        </p>
      </div>

      {/* Content with Suspense */}
      <Suspense fallback={<LoadingSkeleton />}>
        <RiwayatList />
      </Suspense>
    </div>
  );
}

async function RiwayatList() {
  const patients = await getPatientsWithVaccinationStatus();

  return <RiwayatClient patients={patients} />;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}
