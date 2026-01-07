import type { IProductContract } from "../../../core/contracts/module.contracts.js";
import { ModuleRegistryService } from "../../platform/module-registry.service.js";

/**
 * POS Product Adapter
 * Decouples POS from Commerce module.
 */
export class ProductAdapter {
    constructor(private readonly businessUnitId: string) { }

    /**
     * Resolves product data. 
     * If E-Commerce is enabled, fetches from Catalog.
     * If not, potentially uses a local POS-only product list or fails gracefully.
     */
    async getProduct(_productId: string): Promise<IProductContract | null> {
        // 1. Check if Business Unit has Ecommerce module enabled
        const ecommerceEnabled = await this.isEcommerceEnabled();

        if (ecommerceEnabled) {
            // Logic to fetch from Ecommerce module via its public API/Service
            return null; // Placeholder
        }

        // 2. Fallback logic for POS-only customers
        return this.getLocalPOSProduct(_productId);
    }

    private async isEcommerceEnabled(): Promise<boolean> {
        return await ModuleRegistryService.isModuleActive('ecommerce', this.businessUnitId);
    }

    private async getLocalPOSProduct(_productId: string): Promise<IProductContract | null> {
        // Implementation for local products if business doesn't use Full Ecommerce
        return null;
    }
}
