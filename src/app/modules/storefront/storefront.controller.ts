import type { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { StorefrontService } from "./storefront.service.ts";

import AppError from "@shared/errors/app-error.ts";
import { ApiResponse } from "@core/utils/api-response.ts";

// ==========================================
// Config Controllers
// ==========================================

export const getStoreProductsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessUnitId = req.params['businessUnitId'];
        if (!businessUnitId) throw new AppError(400, "Business Unit ID is required", "BAD_REQUEST");

        const result = await StorefrontService.getStoreProducts(businessUnitId, req.query);

        ApiResponse.success(res, result, "Products retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const getStoreConfigController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessUnitId = req.params['businessUnitId'];
        if (!businessUnitId) throw new AppError(400, "Business Unit ID is required", "BAD_REQUEST");

        const result = await StorefrontService.getStoreConfig(businessUnitId);

        ApiResponse.success(res, result, "Store config retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const updateStoreConfigController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessUnitId = req.params['businessUnitId'];
        if (!businessUnitId) throw new AppError(400, "Business Unit ID is required", "BAD_REQUEST");

        const result = await StorefrontService.updateStoreConfig(businessUnitId, req.body);

        ApiResponse.success(res, result, "Store config updated successfully");
    } catch (error) {
        next(error);
    }
};

export const getPageController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { businessUnitId, slug } = req.params;
        if (!businessUnitId) throw new AppError(400, "Business Unit ID is required", "BAD_REQUEST");
        if (!slug) throw new AppError(400, "Slug is required", "BAD_REQUEST");

        const result = await StorefrontService.getPage(businessUnitId, slug);

        if (!result) {
            throw new AppError(404, "Page not found", "PAGE_NOT_FOUND");
        }

        ApiResponse.success(res, result, "Page retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const savePageController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { businessUnitId } = req.params;
        if (!businessUnitId) throw new AppError(400, "Business Unit ID is required", "BAD_REQUEST");

        console.log("savePageController HEADERS:", req.headers['content-type']);
        console.log("savePageController BODY TYPE:", typeof req.body);
        console.log("savePageController BODY:", JSON.stringify(req.body, null, 2));

        if (!req.body || !req.body.slug) {
            console.error("SavePage Body Missing or Slug Missing");
            throw new AppError(400, "Page slug is required (Body empty?)", "BAD_REQUEST");
        }

        const { slug } = req.body;

        const result = await StorefrontService.savePageLayout(businessUnitId, slug, req.body);

        ApiResponse.success(res, result, "Page saved successfully");
    } catch (error) {
        next(error);
    }
};

export const getAllPagesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { businessUnitId } = req.params;
        if (!businessUnitId) throw new AppError(400, "Business Unit ID is required", "BAD_REQUEST");

        const result = await StorefrontService.getAllPages(businessUnitId);

        ApiResponse.success(res, result, "Pages list retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const deletePageController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { businessUnitId, pageId } = req.params;
        if (!businessUnitId) throw new AppError(400, "Business Unit ID is required", "BAD_REQUEST");
        if (!pageId) throw new AppError(400, "Page ID is required", "BAD_REQUEST");

        await StorefrontService.deletePage(businessUnitId, pageId);

        ApiResponse.success(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Page deleted successfully",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
