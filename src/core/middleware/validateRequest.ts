import type { ZodSchema, ZodType } from "zod";
import catchAsync from "../utils/catchAsync.js"


export const validateRequest = (zodSchema: ZodSchema | ZodType | any) => {
  return catchAsync(async (req, _res, next) => {
    const result = await zodSchema.safeParseAsync({ body: req.body, cookies: req.cookies })

    if (!result.success) {
      next(result.error)
    } else {
      next()
    }
  })
}
