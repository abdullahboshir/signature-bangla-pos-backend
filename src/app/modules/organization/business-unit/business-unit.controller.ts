import catchAsync from "@core/utils/catchAsync.ts";
import status from "http-status";
import { createStoreService } from "./business-unit.service.ts";
import { ApiResponse } from "@core/utils/api-response.ts";


export const createStoreController = catchAsync(async (req: any, res) => {
  const {storeData} = req.body;
  const data = await createStoreService(storeData, req?.file)

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Account has been Created Successfully',
    data,
  })
})