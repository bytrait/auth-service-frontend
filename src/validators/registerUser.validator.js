import { z } from 'zod';

export const RegistrationSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  otp: z.string().min(4, 'OTP is required'),
  contact: z.string().min(10, 'Contact number is required'),
  schoolCode: z.string().optional(),
});
