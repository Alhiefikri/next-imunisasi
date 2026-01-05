import { z } from "zod";

enum Gender {
  LAKI_LAKI = "LAKI_LAKI",
  PEREMPUAN = "PEREMPUAN",
}

// ==================== HELPERS ====================

// Di zod.ts
const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" || !v ? undefined : v));
// Di file zod.ts
const nikSchema = z
  .string()
  .trim()
  .length(16, "NIK harus tepat 16 digit")
  .regex(/^\d+$/, "NIK harus berisi angka saja")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v)); // Gunakan undefined, bukan null

// ==================== SCHEMAS ====================

export const PatientFormSchema = z.object({
  id: z.string().optional(),

  // Data Anak
  name: z.string().min(1, "Nama wajib diisi").trim(),
  nik: nikSchema, // ✅ Pakai helper
  birthDate: z.date().optional(),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"], {
    message: "Jenis kelamin wajib dipilih",
  }),
  placeOfBirth: optionalTrimmedString,

  // Data Orang Tua
  motherName: optionalTrimmedString, // ❌ Ganti jadi optional
  nikmother: nikSchema,
  fatherName: optionalTrimmedString, // ❌ Ganti jadi optional
  nikfather: nikSchema,
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9+\-() ]*$/, "Format nomor tidak valid")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  // Data Alamat
  districtId: z.string().optional(),
  districtName: optionalTrimmedString,
  villageId: z.string().optional(),
  villageName: optionalTrimmedString,
  address: optionalTrimmedString,
});

export const VaccineFormSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100).trim(),
    description: optionalTrimmedString,
    ageMonthMin: z.number().int().min(0, "Usia minimal harus >= 0"),
    ageMonthMax: z.number().int().min(0).optional(),
    totalDoses: z.number().int().min(1).max(5, "Dosis maksimal 5"),
    intervalDays: z.number().int().min(0).optional(),
    order: z.number().int().min(0),
    isActive: z.boolean(),
  })
  .refine((data) => !data.ageMonthMax || data.ageMonthMax > data.ageMonthMin, {
    message: "Usia maksimal harus lebih besar dari usia minimal",
    path: ["ageMonthMax"],
  })
  .refine((data) => data.totalDoses <= 1 || data.intervalDays, {
    message: "Interval wajib diisi untuk vaksin dengan dosis > 1",
    path: ["intervalDays"],
  });

export const PosyanduFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).trim(),
  address: z.string().min(1, "Alamat wajib diisi").trim(),
  districtId: optionalTrimmedString,
  districtName: optionalTrimmedString,
  villageId: optionalTrimmedString,
  villageName: optionalTrimmedString,
});

export const ScheduleFormSchema = z.object({
  posyanduId: z.string().min(1, "Posyandu wajib dipilih"),
  date: z.coerce.date().refine((d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, "Tanggal tidak boleh di masa lalu"),
  notes: optionalTrimmedString,
});

export const ImmunizationFormSchema = z
  .object({
    patientId: z.string().min(1, "Pasien wajib dipilih"),
    scheduleId: z.string().min(1, "Jadwal wajib dipilih"),
    status: z.enum(["WAITING", "SERVED", "CANCELLED"]),
    vaccines: z.array(z.string()).default([]),
    notes: optionalTrimmedString,
  })
  .superRefine((data, ctx) => {
    if (data.status === "SERVED" && data.vaccines.length === 0) {
      ctx.addIssue({
        path: ["vaccines"],
        message: "Minimal satu vaksin wajib dipilih",
        code: z.ZodIssueCode.custom,
      });
    }
    if (data.status === "CANCELLED" && !data.notes) {
      ctx.addIssue({
        path: ["notes"],
        message: "Alasan pembatalan wajib diisi",
        code: z.ZodIssueCode.custom,
      });
    }
  });

// ==================== TYPES ====================

export type PatientFormInput = z.input<typeof PatientFormSchema>;
export type PosyanduFormInput = z.input<typeof PosyanduFormSchema>;
export type VaccineFormInput = z.input<typeof VaccineFormSchema>;
export type ImmunizationFormInput = z.input<typeof ImmunizationFormSchema>;

export type PatientFormValues = z.infer<typeof PatientFormSchema>;
export type VaccineFormValues = z.infer<typeof VaccineFormSchema>;
export type PosyanduFormValues = z.infer<typeof PosyanduFormSchema>;
export type ScheduleFormValues = z.infer<typeof ScheduleFormSchema>;
export type ImmunizationFormValues = z.infer<typeof ImmunizationFormSchema>;
