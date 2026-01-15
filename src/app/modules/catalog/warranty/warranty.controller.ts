import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import { WarrantyService } from "./warranty.service.ts";

const createWarranty = catchAsync(async (req: Request, res: Response) => {
  const result = await WarrantyService.createWarranty(req.body, (req as any).user);

  ApiResponse.success(res, result, "Warranty created successfully", httpStatus.CREATED);
});

const getAllWarranties = catchAsync(async (req: Request, res: Response) => {
  const result = await WarrantyService.getAllWarranties(req.query);

  ApiResponse.paginated(
    res,
    result.result,
    result.meta.page,
    result.meta.limit,
    result.meta.total,
    "Warranties retrieved successfully"
  );
});

const getSingleWarranty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WarrantyService.getSingleWarranty(id as string);

  ApiResponse.success(res, result, "Warranty retrieved successfully");
});

const updateWarranty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WarrantyService.updateWarranty(id as string, req.body);

  ApiResponse.success(res, result, "Warranty updated successfully");
});

const deleteWarranty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await WarrantyService.deleteWarranty(id as string);

  ApiResponse.success(res, null, "Warranty deleted successfully");
});

export const WarrantyController = {
  createWarranty,
  getAllWarranties,
  getSingleWarranty,
  updateWarranty,
  deleteWarranty,
};
