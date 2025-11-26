import status from "http-status";

import { createProductService } from "./product-core.service.js";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";



export const createProductController = catchAsync(async (req, res) => {
  const data = await createProductService(req?.body)

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Product has been Created Successfully',
    data,
  })
})