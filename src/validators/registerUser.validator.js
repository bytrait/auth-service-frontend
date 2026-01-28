import { z } from 'zod';

export const RegistrationSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),

  email: z.string().email('Invalid email'),

  // ✅ optional at schema level
  otp: z
    .string()
    .optional()
    .or(z.literal('')),

  contact: z.string().min(10, 'Contact number is required'),

  // ✅ optional reference
  referenceCode: z
    .string()
    .optional()
    .or(z.literal('')),
});
