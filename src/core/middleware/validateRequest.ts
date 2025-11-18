import type { AnyZodObject } from "zod/v3"
import catchAsync from "../utils/catchAsync.js"


export const validateRequest = (zodSchema: AnyZodObject) => {
  return catchAsync(async (req, _res, next) => {
    await zodSchema.safeParseAsync({ body: req.body, cookies: req.cookies })
    next()
  })
} 
  