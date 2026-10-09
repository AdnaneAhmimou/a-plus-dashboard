import { z } from "zod";

export const createBoxSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, "Box number is required")
    .max(50, "Box number is too long"),
});
export type CreateBoxInput = z.infer<typeof createBoxSchema>;

// Email is deliberately not editable here — it's the login identifier,
// and changing it without a re-verification step would be a real
// account-security gap. Admins can edit contact details, not identity.
export const updatePatientSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  // Empty string means "clear the phone number" — handled explicitly in
  // the route (converted to null), not treated as "field omitted".
  phone: z.string().trim().max(30).default(""),
});
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
