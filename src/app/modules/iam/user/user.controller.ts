import { ApiResponse } from "@core/utils/api-response.ts";

import {
  createCustomerService,
  getUsersService,
} from "./user.service.js";

import status from "http-status";
import catchAsync from "@core/utils/catchAsync.ts";

export const createCustomerController = catchAsync(async (req: any, res) => {
  const { customerData, password } = req.body;
  const newUser = await createCustomerService(
    customerData,
    password,
    req?.file
  );

  ApiResponse.success(res, {
    success: true,
    statusCode: 201,
    message: "Account has been Created Successfully",
    data: newUser,
  });
});

// export const createVendorController = catchAsync(async (req: any, res) => {
//   const { vendorData, password } = req.body;
//   const data = await createVendorService(vendorData, password, req?.file);

// ApiResponse.success(res, {
//   success: true,
//   statusCode: status.OK,
//   message: "Account has been Created Successfully",
//   data,
// });

// });

export const getUsersController = catchAsync(async (req: any, res) => {
  const data = await getUsersService();

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "Users has been retrieved Successfully",
    data,
  });
});
