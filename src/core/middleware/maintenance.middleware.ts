
import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/api-response.js";
import appConfig from "../../shared/config/app.config.js";

export const maintenanceMode = (_req: Request, res: Response, next: NextFunction) => {
    // Skip maintenance check for super admin login or bypass routes if needed
    if (appConfig.security.maintenance_mode) {
        // You can add logic here to allow specific IPs or roles even in maintenance mode
        return ApiResponse.error(res, "System is under maintenance. Please try again later.", "MAINTENANCE_MODE", 503);
    }
    next();
};
