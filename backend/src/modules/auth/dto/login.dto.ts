import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'INVALID_EMAIL_FORMAT' }),
  password: z.string().min(1, { message: 'PASSWORD_REQUIRED' }),
});

export type LoginDto = z.infer<typeof loginSchema>;