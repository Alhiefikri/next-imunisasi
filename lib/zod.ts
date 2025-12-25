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
  fatherName: z
    .string()
    .min(2, "Nama Ayah harus minimal 2 karakter.")
    .max(100, "Nama Ayah maksimal 100 karakter.")
    .trim()
    .optional(),
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

export type PatientFormValues = z.infer<typeof PatientformSchema>;
export type VaccineFormValues = z.infer<typeof VaccineFormSchema>;
export type PosyanduFormValues = z.infer<typeof PosyanduFormSchema>;
