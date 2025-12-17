import { ApiResponse } from "@core/utils/api-response.ts";

import {
  createCustomerService,
  getUsersService,
  updateUserService,
  getUserSettingsService,
  updateUserSettingsService,
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

export const updateUserController = catchAsync(async (req: any, res) => {
  const { id } = req.params;
  const updatedUser = await updateUserService(id, req.body);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "User updated successfully",
    data: updatedUser,
  });
});


export const getUserSettingsController = catchAsync(async (req: any, res) => {
  const { id } = req.user; // Assuming user ID is in req.user from auth middleware
  const data = await getUserSettingsService(id);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "Settings retrieved successfully",
    data,
  });
});

export const updateUserSettingsController = catchAsync(async (req: any, res) => {
  const { id } = req.user;
  const data = await updateUserSettingsService(id, req.body);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "Settings updated successfully",
    data,
  });
});
