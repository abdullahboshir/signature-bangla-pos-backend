import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";
import AppError from "@shared/errors/app-error.ts";
import { OrganizationService } from "./organization.service.js";

const organizationService = new OrganizationService();

export const createOrganization = catchAsync(async (req: Request, res: Response) => {
    const organization = await organizationService.createOrganization(req.body);
    ApiResponse.success(res, organization, "Organization created successfully", httpStatus.CREATED);
});

export const getAllOrganizations = catchAsync(async (req: Request, res: Response) => {
    const organizations = await organizationService.getAllOrganizations(req.user);
    ApiResponse.success(res, organizations, "Organizations retrieved successfully");
});

export const getOrganizationById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params["id"];
    if (!id) {
        throw new AppError(httpStatus.BAD_REQUEST, "Organization ID is required", "BAD_REQUEST");
    }

    const organization = await organizationService.getOrganizationById(id);
    if (!organization) {
        throw new AppError(httpStatus.NOT_FOUND, "Organization not found", "NOT_FOUND");
    }

    ApiResponse.success(res, organization, "Organization retrieved successfully");
});

export const getOrganizationDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const organizationId = req.params["organizationId"];
    if (!organizationId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Organization ID is required", "BAD_REQUEST");
    }
    const stats = await organizationService.getOrganizationDashboardStats(organizationId);
    ApiResponse.success(res, stats, "Organization dashboard stats retrieved successfully");
});

export const updateOrganizationTenantConfig = catchAsync(async (req: Request, res: Response) => {
    const id = req.params["id"];
    const config = req.body;
    
    if (!id) {
        throw new AppError(httpStatus.BAD_REQUEST, "Organization ID is required", "BAD_REQUEST");
    }

    const organization = await organizationService.updateTenantConfig(id, config);
    if (!organization) {
        throw new AppError(httpStatus.NOT_FOUND, "Organization not found", "NOT_FOUND");
    }

    ApiResponse.success(res, organization, "Tenant configuration updated successfully");
});
