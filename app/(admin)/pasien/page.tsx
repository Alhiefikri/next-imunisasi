// app/pasien/page.tsx
import { DataTable } from "@/components/data-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./clients/columns";

import {
  getPatients,
  type PatientFilters as Filters,
} from "@/app/actions/patiens";
import { PatientFilters } from "./_components/patient-filters";

type Props = {
  searchParams: Promise<{
    search?: string;
    gender?: string;
    ageMin?: string;
    ageMax?: string;
    districtId?: string;
    villageId?: string;
    vaccinationStatus?: string;
  }>;
};

export default async function PasienPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters: Filters = {
    search: params.search,
    gender: params.gender as any,
    ageMin: params.ageMin ? parseInt(params.ageMin) : undefined,
    ageMax: params.ageMax ? parseInt(params.ageMax) : undefined,
    districtId: params.districtId,
    villageId: params.villageId,
    vaccinationStatus: params.vaccinationStatus as any,
  };

  const data = await getPatients(filters);

  return (
    <>
      <div className="flex flex-col p-8">
        <div className="flex w-full justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pasien</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href="/pasien/new">
            <Button className="cursor-pointer">Tambah Pasien</Button>
          </Link>
        </div>
      </div>

      <div className="px-8">
        <PatientFilters />
      </div>

      <div className="p-8 flex flex-col">
        <DataTable data={data} columns={columns} />
      </div>
    </>
  );
}
