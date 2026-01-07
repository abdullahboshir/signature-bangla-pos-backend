import type { IInventoryContract } from "../../../core/contracts/module.contracts.js";
import { ModuleRegistryService } from "../../platform/module-registry.service.js";

/**
 * POS Inventory Adapter
 * Resolves where to commit inventory changes (ERP, Commerce, or nowhere).
 */
export class InventoryAdapter {
    constructor(private readonly businessUnitId: string) { }

    async updateStock(_payload: IInventoryContract): Promise<boolean> {
        const erpActive = await this.isModuleActive('erp');
        const ecommerceActive = await this.isModuleActive('ecommerce');

        if (erpActive) {
            // 1. Prioritize ERP Inventory if enabled
            // await ERPService.updateStock(payload);
            return true;
        }

        if (ecommerceActive) {
            // 2. Fallback to Ecommerce Product Inventory
            // await EcommerceService.updateProductStock(payload);
            return true;
        }

        // 3. System functions with local POS tracking or no tracking if disabled
        return true;
    }

    private async isModuleActive(moduleId: string): Promise<boolean> {
        return await ModuleRegistryService.isModuleActive(moduleId, this.businessUnitId);
    }
}
