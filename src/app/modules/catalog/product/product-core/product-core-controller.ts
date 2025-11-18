import status from "http-status";
import catchAsync from "../../../utils/catchAsync.js";
import { createProductService } from "./product-core.service.js";
import sendResponse from "../../../utils/sendResponse.js";



export const createProductController = catchAsync(async (req, res) => {
  const data = await createProductService(req?.body)

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Product has been Created Successfully',
    data,
  })
})