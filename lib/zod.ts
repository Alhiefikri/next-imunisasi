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
});

export type PatientFormValues = z.infer<typeof PatientformSchema>;
