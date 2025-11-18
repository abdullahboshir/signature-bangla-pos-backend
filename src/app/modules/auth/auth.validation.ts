import { z } from 'zod';

export const loginZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});


