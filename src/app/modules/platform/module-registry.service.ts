import { MODULE_REGISTRY } from "./module-registry.js";
import BusinessUnit from "./organization/business-unit/core/business-unit.model.js";

/**
 * ModuleRegistryService
 * Provides a standardized way to check if a module or feature is enabled for a specific context.
 */
export class ModuleRegistryService {
    /**
     * Checks if a module is active for a specific business unit.
     * Combining static Registry metadata with dynamic BusinessUnit database settings.
     */
    static async isModuleActive(
        moduleId: string,
        businessUnitId: string
    ): Promise<boolean> {
        const moduleMeta = MODULE_REGISTRY[moduleId];
        if (!moduleMeta) return false;

        // 1. Static validation (Always active infrastructure)
        if (moduleId === 'iam' || moduleId === 'platform') return true;

        // 2. Dynamic check from Business Unit settings
        try {
            const bu = await BusinessUnit.findOne({
                $or: [{ _id: businessUnitId }, { id: businessUnitId }]
            }).select('activeModules');

            if (!bu) return false;

            const moduleSetting = (bu.activeModules as any)?.[moduleId];

            // Support both boolean and object { enabled, features }
            if (typeof moduleSetting === 'boolean') return moduleSetting;
            if (typeof moduleSetting === 'object' && moduleSetting !== null) {
                return !!moduleSetting.enabled;
            }

            return false;
        } catch (error) {
            return false; // Fallback to false on DB error to be safe (Fail Closed)
        }
    }

    /**
     * Checks if a specific feature within a module is active.
     */
    static async isFeatureEnabled(
        moduleId: string,
        featureKey: string,
        businessUnitId: string
    ): Promise<boolean> {
        const isActive = await this.isModuleActive(moduleId, businessUnitId);
        if (!isActive) return false;

        const moduleMeta = MODULE_REGISTRY[moduleId];
        return moduleMeta?.provides.includes(featureKey) || false;
    }
}
