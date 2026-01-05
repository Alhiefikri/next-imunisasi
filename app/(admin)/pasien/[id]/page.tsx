import { getPatient } from "@/app/actions/patiens";
import PatientForm from "@/components/patient-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const patient = isNew ? null : await getPatient(id);

  if (!isNew && !patient) {
    return <div>Pasien tidak ditemukan</div>;
  }

  const initialData = patient
    ? {
        name: patient.name,
        nik: patient.nik ?? undefined,
        birthDate: patient.birthDate,
        gender: patient.gender,
        placeOfBirth: patient.placeOfBirth ?? undefined,
        motherName: patient.motherName ?? undefined,
        nikmother: patient.nikmother ?? undefined,
        fatherName: patient.fatherName ?? undefined,
        nikfather: patient.nikfather ?? undefined,
        phoneNumber: patient.phoneNumber ?? undefined,
        districtId: patient.districtId ?? undefined,
        districtName: patient.districtName ?? undefined,
        villageId: patient.villageId ?? undefined,
        villageName: patient.villageName ?? undefined,
        address: patient.address ?? undefined,
      }
    : undefined;

  return (
    <>
      <div className="flex flex-col p-8">
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
              {isNew ? "Tambah Pasien" : patient?.name}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-8">
        <PatientForm
          initialData={initialData}
          patientId={isNew ? undefined : id}
        />
      </div>
    </>
  );
}
