/**
 * Core Contracts for Cross-Module Communication
 * These interfaces allow modules to depend on abstractions rather than concrete implementations.
 */

export interface IProductContract {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    price: {
        base: number;
        sale: number;
        currency: string;
    };
    stock: {
        total: number;
        isAvailable: boolean;
    };
    category: {
        id: string;
        name: string;
    };
    images: string[];
    availableModules: string[];
}

export interface IInventoryContract {
    productId: string;
    outletId: string;
    quantity: number;
}

export interface IInventoryServiceContract {
    checkAvailability(productId: string, outletId: string, quantity: number): Promise<boolean>;
    reserveStock(productId: string, outletId: string, quantity: number, session?: any): Promise<boolean>;
    releaseStock(productId: string, outletId: string, quantity: number, session?: any): Promise<void>;
    updateStock(productId: string, outletId: string, quantity: number, operation: 'increase' | 'decrease' | 'set', session?: any): Promise<void>;
}

export interface IModuleGuardContract {
    isModuleEnabled(moduleId: string, businessUnitId: string): Promise<boolean>;
    getModuleFeatureStatus(moduleId: string, feature: string, businessUnitId: string): Promise<boolean>;
}
