
import type { ISystemSettings } from '@app/modules/platform/settings/system-settings/system-settings.interface.ts';
import { SystemSettings } from '@app/modules/platform/settings/system-settings/system-settings.model.ts';
import type { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { CacheManager } from '../../core/utils/caching/cache-manager.js';
import { ApiResponse } from '@core/utils/api-response.ts';

const moduleGuard = (requiredModule: keyof ISystemSettings['enabledModules']) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Fetch global settings - Cached for performance 🚀
            const settings = await CacheManager.wrap(
                'system-settings',
                async () => await SystemSettings.getSettings(),
                300 // 5 minutes TTL
            );

            // Safety check: if configuration is somehow missing
            if (!settings || !settings.enabledModules) {
                return next();
            }

            const isEnabled = settings.enabledModules[requiredModule];

            if (isEnabled === false) {
                return ApiResponse.error(
                    res,
                    `The '${requiredModule}' module is currently disabled by system administrator.`,
                    'FEATURE_DISABLED',
                    httpStatus.FORBIDDEN
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default moduleGuard;
