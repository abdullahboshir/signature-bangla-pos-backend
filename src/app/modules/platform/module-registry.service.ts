import { MODULE_REGISTRY } from "./module-registry.ts";
import { License } from "./license/license.model.ts";
import { Package } from "./package/package.model.ts";
import BusinessUnit from "./organization/business-unit/core/business-unit.model.ts";

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
        // 1. Static validation (Always active infrastructure)
        if (moduleId === 'iam' || moduleId === 'platform' || moduleId === 'saas' || moduleId === 'erp') return true;

        const moduleMeta = MODULE_REGISTRY[moduleId];
        if (!moduleMeta) return false;

        try {
            // 2. Fetch Business Unit's License
            // We link License directly to BusinessUnit via clientId
            const license = await License.findOne({
                clientId: businessUnitId,
                status: { $in: ['active', 'expired'] }
            }).populate('packageId');

            if (!license) return false;

            // 3. Status Check (Suspended/Revoked should block immediately)
            if (license.status === 'suspended' || license.status === 'revoked') return false;

            // 4. Date-Driven Enforcement (Grace Period Logic)
            if (license.nextBillingDate && new Date(license.nextBillingDate) < new Date()) {
                const pkg = license.packageId as any;
                const gracePeriodDays = pkg?.gracePeriodDays || 0;

                const gracePeriodExpiry = new Date(license.nextBillingDate);
                gracePeriodExpiry.setDate(gracePeriodExpiry.getDate() + gracePeriodDays);

                // If currently past the grace period expiration
                if (new Date() > gracePeriodExpiry) {
                    // Note: We don't update DB status here to avoid side-effects in a read-only check
                    // Status updates should be handled by a background worker
                    return false;
                }
            }

            // 5. Dynamic check from Business Unit settings (Manual Overrides)
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
            console.error(`[ModuleRegistry] Error checking module ${moduleId}:`, error);
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
