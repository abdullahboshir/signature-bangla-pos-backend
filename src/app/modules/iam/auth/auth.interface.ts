import z from "zod";
import { loginZodSchema } from "./auth.validation.js";

export type TLoginPayload = z.infer<typeof loginZodSchema>;