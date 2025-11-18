import status from "http-status";
import catchAsync from "../../../utils/catchAsync.js";
import sendResponse from "../../../utils/sendResponse.js";
import { createStoreService } from "./store-core.service.js";

export const createStoreController = catchAsync(async (req: any, res) => {
  const {storeData} = req.body;
  const data = await createStoreService(storeData, req?.file)

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Account has been Created Successfully',
    data,
  })
})