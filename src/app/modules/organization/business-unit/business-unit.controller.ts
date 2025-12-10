import catchAsync from "@core/utils/catchAsync.ts";
import status from "http-status";
import { BusinessUnitService } from "./business-unit.service.ts";
import { ApiResponse } from "@core/utils/api-response.ts";


export const createBusinessUnitController = catchAsync(async (req: any, res) => {
  const businessUnitData = req.body;
  const data = await BusinessUnitService.createBusinessUnit(businessUnitData)

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Account has been Created Successfully',
    data,
  })
})

export const getAllBusinessUnitsController = catchAsync(async (req, res) => {
  const data = await BusinessUnitService.getAllBusinessUnits();
  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Business Units retrieved successfully',
    data,
  });
});