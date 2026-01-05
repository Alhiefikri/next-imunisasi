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
import { getPatients } from "@/app/actions/patiens";

export default async function PasienPage() {
  const data = await getPatients();

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

      <div className="p-8 flex flex-col">
        <DataTable data={data} columns={columns} />
      </div>
    </>
  );
}
