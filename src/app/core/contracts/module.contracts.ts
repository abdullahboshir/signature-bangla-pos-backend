/**
 * Core Contracts for Cross-Module Communication
 * These interfaces allow modules to depend on abstractions rather than concrete implementations.
 */

export interface IProductContract {
    id: string | any;
    name: string;
    sku: string;
    price: number;
    stock?: number;
    category?: string;
    isAvailable: boolean;
}

export interface IInventoryContract {
    productId: string;
    businessUnitId: string;
    quantity: number;
    operation: 'increase' | 'decrease' | 'set';
}

export interface IModuleGuardContract {
    isModuleEnabled(moduleId: string, businessUnitId: string): Promise<boolean>;
    getModuleFeatureStatus(moduleId: string, feature: string, businessUnitId: string): Promise<boolean>;
}
