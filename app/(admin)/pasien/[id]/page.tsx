import { getUniquePatient } from "@/app/actions/patiens";
import PatientForm from "@/components/patient-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getUniquePatient(id);
  console.log(patient);
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
                <BreadcrumbLink href="/pasien">Pasien</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {id === "new" ? "New" : patient?.name}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="p-8 flex flex-col">
        {patient ? (
          <PatientForm
            id={patient.id}
            name={patient.name}
            nik={patient.nik ?? ""}
            birthDate={patient.birthDate}
            gender={patient.gender}
            placeOfBirth={patient.placeOfBirth ?? ""}
            parentName={patient.parentName}
            phoneNumber={patient.phoneNumber ?? ""}
            districtId={patient.districtId ?? ""}
            villageId={patient.villageId ?? ""}
            districtName={patient.districtName ?? ""}
            villageName={patient.villageName ?? ""}
            address={patient.address ?? ""}
          />
        ) : (
          <PatientForm
            id=""
            name=""
            nik=""
            birthDate={undefined}
            gender={undefined}
            placeOfBirth=""
            parentName=""
            phoneNumber=""
            districtId=""
            districtName=""
            villageId=""
            villageName=""
            address=""
          />
        )}
      </div>
    </>
  );
}
