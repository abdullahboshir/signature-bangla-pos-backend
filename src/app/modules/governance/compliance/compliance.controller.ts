import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";
import { ComplianceService } from "./compliance.service.ts";

const uploadDocument = catchAsync(async (req: Request, res: Response) => {
    const result = await ComplianceService.uploadDocument({
        ...req.body,
        uploadedBy: req.user?.['_id']
    });
    ApiResponse.success(res, result, "Document uploaded successfully", httpStatus.CREATED);
});

const getAllDocuments = catchAsync(async (req: Request, res: Response) => {
    const result = await ComplianceService.getAllDocuments(req.query);
    ApiResponse.success(res, result, "Documents retrieved successfully");
});

const deleteDocument = catchAsync(async (req: Request, res: Response) => {
    await ComplianceService.deleteDocument(req.params['id'] as string);
    ApiResponse.success(res, null, "Document deleted successfully");
});

export const ComplianceController = {
    uploadDocument,
    getAllDocuments,
    deleteDocument
};
