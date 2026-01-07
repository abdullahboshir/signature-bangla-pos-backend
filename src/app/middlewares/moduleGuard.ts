import { SystemSettings } from '@app/modules/platform/settings/system-settings/system-settings.model.ts';
import type { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { CacheManager } from '../../core/utils/caching/cache-manager.js';
import { ApiResponse } from '@core/utils/api-response.ts';
import { ModuleRegistryService } from '@app/modules/platform/module-registry.service.js';

/**
 * moduleGuard Middleware
 * Ensures that a module is enabled both globally and for the specific Business Unit.
 */
const moduleGuard = (requiredModule: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Check Global System Settings (Master Kill Switch)
            const settings = await CacheManager.wrap(
                'system-settings',
                async () => await SystemSettings.getSettings(),
                300 // 5 minutes TTL
            );

            if (settings?.enabledModules && (settings.enabledModules as any)[requiredModule] === false) {
                return ApiResponse.error(
                    res,
                    `The '${requiredModule}' module is disabled system-wide.`,
                    'SYSTEM_FEATURE_DISABLED',
                    httpStatus.FORBIDDEN
                );
            }

            // 2. Check Business Unit Specific Activation
            const businessUnitId = req.headers['x-business-unit-id'] as string || req.body?.businessUnit;

            if (businessUnitId) {
                const isBUActive = await ModuleRegistryService.isModuleActive(requiredModule, businessUnitId);
                if (!isBUActive) {
                    return ApiResponse.error(
                        res,
                        `The '${requiredModule}' module is not active for this Business Unit.`,
                        'MODULE_NOT_ACTIVE',
                        httpStatus.FORBIDDEN
                    );
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default moduleGuard;
