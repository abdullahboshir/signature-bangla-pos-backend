
import type { Response, Request } from "express";
import httpStatus from "http-status";
import { ApiResponse } from "@core/utils/api-response.ts";

const notFound = (req: Request, res: Response) => {
  return ApiResponse.error(
    res,
    `Route ${req.originalUrl} not found!`,
    "NOT_FOUND",
    httpStatus.NOT_FOUND
  );
};

export default notFound;
