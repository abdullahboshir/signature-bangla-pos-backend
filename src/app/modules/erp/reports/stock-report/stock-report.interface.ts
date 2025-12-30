export interface IStockValuation {
    _id: string; // Product ID
    name: string;
    sku: string;
    stock: number;
    costPrice: number;
    sellingPrice: number;
    totalCostValue: number; // stock * costPrice
    totalRetailValue: number; // stock * sellingPrice
}

export interface IStockSummary {
    totalStockCount: number;
    totalCostValue: number;
    totalRetailValue: number;
    lowStockItems: number;
}

export interface IStockReportFilters {
    businessUnit?: string;
    outlet?: string;
    category?: string;
    brand?: string;
    lowStockOnly?: boolean;
}
