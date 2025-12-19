import type { AnyZodObject } from "zod/v3"
import catchAsync from "../utils/catchAsync.js"


export const validateRequest = (zodSchema: AnyZodObject) => {
  return catchAsync(async (req, _res, next) => {
    console.log("ValidateRequest Input Body:", JSON.stringify(req.body, null, 2));
    console.log("Content-Type:", req.headers['content-type']);
    const result = await zodSchema.safeParseAsync({ body: req.body, cookies: req.cookies })

    if (!result.success) {
      next(result.error)
    } else {
      next()
    }
  })
}
