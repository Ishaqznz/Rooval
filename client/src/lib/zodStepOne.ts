import { z } from "zod";

export const stepOneSchema = z.object({
    profilePhoto: z
        .any()
        .refine(
            (file) => !file || file instanceof File,
            "Invalid file format"
        )
        .optional(),

    fullName: z
        .string()
        .min(3, "Full name must be at least 3 characters long")
        .max(50, "Full name must not exceed 50 characters"),

    gender: z.enum(["male", "female", "other"]).refine(
        (value) => !!value,
        "Gender is required"
    ),

    phone: z
        .string()
        .min(8, "Phone number must be at least 8 digits")
        .max(15, "Phone number must not exceed 15 digits")
        .regex(/^[0-9+\-() ]+$/, "Invalid phone number format"),

    registrationNumber: z
        .string()
        .min(3, "Registration number is too short")
        .max(30, "Registration number is too long"),

    country: z
        .string()
        .min(2, "Country name is too short")
        .max(50, "Country name is too long"),

    state: z
        .string()
        .min(2, "State/Province name is too short")
        .max(50, "State/Province name is too long"),

    experience: z
        .string()
        .refine((val) => Number(val) >= 0, "Experience cannot be negative")
        .refine((val) => Number(val) <= 60, "Experience seems invalid (0-60)"),

    bio: z
        .string()
        .min(10, "Bio must be at least 10 characters long")
        .max(500, "Bio is too long"),
});

export type StepOneSchemaType = z.infer<typeof stepOneSchema>;
