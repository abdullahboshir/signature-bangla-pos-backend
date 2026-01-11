import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";
import AppError from "@shared/errors/app-error.ts";
import { CompanyService } from "./company.service.ts";

const companyService = new CompanyService();

export const createCompany = catchAsync(async (req: Request, res: Response) => {
    const company = await companyService.createCompany(req.body);
    ApiResponse.success(res, company, "Company created successfully", httpStatus.CREATED);
});

export const getAllCompanies = catchAsync(async (req: Request, res: Response) => {
    const companies = await companyService.getAllCompanies(req.user);
    ApiResponse.success(res, companies, "Companies retrieved successfully");
});

export const getCompanyById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params["id"];
    if (!id) {
        throw new AppError(httpStatus.BAD_REQUEST, "Company ID is required", "BAD_REQUEST");
    }

    const company = await companyService.getCompanyById(id);
    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Company not found", "NOT_FOUND");
    }

    ApiResponse.success(res, company, "Company retrieved successfully");
});
