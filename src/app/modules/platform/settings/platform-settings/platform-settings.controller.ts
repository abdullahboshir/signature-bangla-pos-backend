import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from "@core/utils/api-response.js";
import { PlatformSettingsService } from './platform-settings.service.js';

export const PlatformSettingsController = {
    async getSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await PlatformSettingsService.getSettings();
            ApiResponse.success(res, result, "Platform settings retrieved successfully");
        } catch (error) {
            next(error);
        }
    },

    async updateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await PlatformSettingsService.updateSettings(req.body);
            ApiResponse.success(res, result, "Platform settings updated successfully");
        } catch (error) {
            next(error);
        }
    }
};
