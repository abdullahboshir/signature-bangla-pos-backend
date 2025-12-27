
import type { ISystemSettings } from '@app/modules/settings/system-settings/system-settings.interface.ts';
import { SystemSettings } from '@app/modules/settings/system-settings/system-settings.model.ts';
import type { Request, Response, NextFunction } from 'express';

import httpStatus from 'http-status';

import { CacheManager } from '../../core/utils/caching/cache-manager.js';

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
                // Fail open or closed? Closed is safer for security.
                // But for a toggle system, maybe log warning and proceed? 
                // Let's assume strict compliance.
                return next();
            }

            const isEnabled = settings.enabledModules[requiredModule];

            if (isEnabled === false) {
                return res.status(httpStatus.FORBIDDEN).json({
                    success: false,
                    message: `feature_disabled: The '${requiredModule}' module is currently disabled by system administrator.`,
                    errorMessages: [
                        {
                            path: req.originalUrl,
                            message: `Access to ${requiredModule} resources is restricted.`
                        }
                    ]
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default moduleGuard;
