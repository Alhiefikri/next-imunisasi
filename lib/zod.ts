import z from "zod";

export const PatientformSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "Nama harus minimal 2 karakter.")
    .max(100, "Nama maksimal 100 karakter.")
    .trim(),
  nik: z
    .string()
    .trim()
    .length(16, "NIK harus tepat 16 digit.")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka.")
    .or(z.literal("")), // Boleh kosong atau harus valid 16 digit
  birthDate: z.date(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
  placeOfBirth: z.string().max(100, "Tempat lahir maksimal 100 karakter."),
  motherName: z
    .string()
    .min(2, "Nama Ibu harus minimal 2 karakter.")
    .max(100, "Nama Ibu maksimal 100 karakter.")
    .trim(),
  nikmother: z
    .string()
    .trim()
    .length(16, "NIK harus tepat 16 digit.")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka.")
    .or(z.literal("")), // Boleh kosong atau harus valid 16 digit
  fatherName: z
    .string()
    .min(2, "Nama Ayah harus minimal 2 karakter.")
    .max(100, "Nama Ayah maksimal 100 karakter.")
    .trim(),
  nikfather: z
    .string()
    .trim()
    .length(16, "NIK harus tepat 16 digit.")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka.")
    .or(z.literal("")), // Boleh kosong atau harus valid 16 digit
  phoneNumber: z
    .string()
    .max(15, "Nomor telepon maksimal 15 karakter.")
    .optional(),

  // Alamat
  districtId: z.string().optional(),
  districtName: z.string().optional(),
  villageId: z.string().optional(),
  villageName: z.string().optional(),
  address: z.string().trim().optional(),
});

export const VaccineFormSchema = z.object({
  name: z.string().min(2, "Nama vaksin harus minimal 2 karakter."),
  description: z.string().optional(),
});

export const PosyanduFormSchema = z.object({
  name: z.string().min(2, "Nama posyandu harus minimal 2 karakter."),
  districtId: z.string().optional(),
  districtName: z.string().optional(),
  villageId: z.string().optional(),
  villageName: z.string().optional(),
  address: z.string().min(2, "Nama posyandu harus minimal 2 karakter."),
});

export const JadwalFormSchema = z.object({
  posyanduId: z.string().min(1, "Posyandu harus dipilih."),
  date: z.date().refine((date) => date >= new Date(), {
    message: "Tanggal jadwal harus di masa depan.",
  }),
  notes: z.string().optional(),
});

export type JadwalFormValues = z.infer<typeof JadwalFormSchema>;
export type PatientFormValues = z.infer<typeof PatientformSchema>;
export type VaccineFormValues = z.infer<typeof VaccineFormSchema>;
export type PosyanduFormValues = z.infer<typeof PosyanduFormSchema>;

export const ImmunizationFormSchema = z
  .object({
    id: z.string().optional(),

    patientId: z.string().min(1, "Pasien wajib diisi"),
    scheduleId: z.string().min(1, "Jadwal wajib diisi"),

    status: z.enum(["SERVED", "CANCELLED", "WAITING"]),

    vaccines: z.array(z.string()),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "SERVED" && data.vaccines.length === 0) {
      ctx.addIssue({
        path: ["vaccines"],
        message: "Minimal pilih satu vaksin",
        code: "custom",
      });
    }

    if (data.status === "CANCELLED" && !data.notes) {
      ctx.addIssue({
        path: ["notes"],
        message: "Alasan wajib diisi",
        code: "custom",
      });
    }
  });

export type ImmunizationFormValues = z.infer<typeof ImmunizationFormSchema>;
