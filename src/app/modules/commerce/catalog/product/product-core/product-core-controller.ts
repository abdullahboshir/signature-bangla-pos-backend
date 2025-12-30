import status from "http-status";
import { createProductService, getAllProductsService, getProductByIdService, updateProductService, deleteProductService } from "./product-core.service.js";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import { sanitizePayload } from "@core/utils/mutation-helper.ts";



export const createProductController = catchAsync(async (req, res) => {
  // Sanitize payload (Service handles BU resolution)
  const cleanPayload = sanitizePayload(req.body, ['primaryCategory', 'unit', 'outlet', 'businessUnit']);

  const data = await createProductService(cleanPayload);

  ApiResponse.success(
    res,
    data,
    'Product has been Created Successfully',
    status.OK
  )
})


export const getAllProductsController = catchAsync(async (req: any, res) => {
  const result = await getAllProductsService(req.query);

  if (result && result.meta) {
    ApiResponse.paginated(
      res,
      result.result,
      result.meta.page,
      result.meta.limit,
      result.meta.total,
      'Products retrieved successfully',
      status.OK
    );
  } else {
    ApiResponse.success(
      res,
      result,
      'Products retrieved successfully',
      status.OK
    );
  }
});

export const getProductByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = await getProductByIdService(id as string);
  ApiResponse.success(
    res,
    data,
    'Product retrieved successfully',
    status.OK
  );
});

export const updateProductController = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Sanitize payload (Service handles BU resolution)
  const cleanPayload = sanitizePayload(req.body, ['primaryCategory', 'unit', 'outlet', 'businessUnit']);

  const data = await updateProductService(id as string, cleanPayload);
  ApiResponse.success(
    res,
    data,
    'Product updated successfully',
    status.OK
  );
});

export const deleteProductController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const force = req.query['force'] === 'true';
  const data = await deleteProductService(id as string, force);
  ApiResponse.success(
    res,
    data,
    force ? 'Product permanently deleted' : 'Product moved to trash',
    status.OK
  );
});