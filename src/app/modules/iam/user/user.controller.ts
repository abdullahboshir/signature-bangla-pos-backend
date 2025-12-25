import { ApiResponse } from "@core/utils/api-response.ts";

import {
  createCustomerService,
  getUsersService,
  getSingleUserService,
  updateUserService,
  getUserSettingsService,
  updateUserSettingsService,
  updateProfileService,
  deleteUserService,
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

  ApiResponse.success(
    res,
    newUser,
    "Account has been Created Successfully",
    201
  );
});





export const deleteUserController = catchAsync(async (req: any, res) => {
  const { id } = req.params;
  await deleteUserService(id);

  ApiResponse.success(
    res,
    null,
    "User deleted successfully",
    status.OK
  );
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
  const result = await getUsersService(req.query);

  if (result && result.meta) {
    ApiResponse.paginated(
      res,
      result.result,
      result.meta.page,
      result.meta.limit,
      result.meta.total,
      "Users retrieved successfully",
      status.OK
    );
  } else {
    ApiResponse.success(
      res,
      result,
      "Users retrieved successfully",
      status.OK
    );
  }
});

export const getSingleUserController = catchAsync(async (req: any, res) => {
  const { id } = req.params;
  const result = await getSingleUserService(id);

  ApiResponse.success(
    res,
    result,
    "User retrieved successfully",
    status.OK
  );
});

export const updateUserController = catchAsync(async (req: any, res) => {
  const { id } = req.params;
  const updatedUser = await updateUserService(id, req.body, req.file);

  ApiResponse.success(
    res,
    updatedUser,
    "User updated successfully",
    status.OK
  );
});

export const updateProfileController = catchAsync(async (req: any, res) => {
  const { userId } = req.user;
  const updatedUser = await updateProfileService(userId, req.body, req.file);

  ApiResponse.success(
    res,
    updatedUser,
    "Profile updated successfully",
    status.OK
  );
});


export const getUserSettingsController = catchAsync(async (req: any, res) => {
  const { id } = req.user; // Assuming user ID is in req.user from auth middleware
  const data = await getUserSettingsService(id);

  ApiResponse.success(
    res,
    data,
    "Settings retrieved successfully",
    status.OK
  );
});

export const updateUserSettingsController = catchAsync(async (req: any, res) => {
  const { id } = req.user;
  const data = await updateUserSettingsService(id, req.body);

  ApiResponse.success(
    res,
    data,
    "Settings updated successfully",
    status.OK
  );
});
