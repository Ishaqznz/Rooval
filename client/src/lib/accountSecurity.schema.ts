import { z } from "zod";

export const accountSecuritySchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),

    confirmPassword: z.string(),

    newEmail: z
      .string()
      .email("Invalid email")
      .optional(),

    confirmNewEmail: z
      .string()
      .optional(),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) =>
      !data.newEmail ||
      data.newEmail === data.confirmNewEmail,
    {
      message: "Emails do not match",
      path: ["confirmNewEmail"],
    }
  );

export type AccountSecurityFormData = z.infer<
  typeof accountSecuritySchema
>;
