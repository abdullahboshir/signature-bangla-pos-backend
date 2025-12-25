export interface IDailySalesStat {
    _id: string; // Date string (YYYY-MM-DD)
    totalSales: number;
    totalOrders: number;
}

export interface ITopProductStat {
    _id: string; // Product ID
    name: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface ISalesReportResponse {
    dailySales: IDailySalesStat[];
    topProducts: ITopProductStat[];
    // Can add categoryPerformance later
}

// Filter Interface
export interface ISalesReportFilters {
    startDate?: string;
    endDate?: string;
    businessUnit?: string;
    outlet?: string;
}
