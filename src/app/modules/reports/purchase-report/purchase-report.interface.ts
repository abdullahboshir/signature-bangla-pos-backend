export interface IPurchaseStat {
    _id: string; // Date or Supplier ID
    totalPurchases: number;
    totalAmount: number;
    totalPaid: number;
    totalDue: number;
}

export interface IPurchaseReportFilters {
    startDate?: string;
    endDate?: string;
    businessUnit?: string;
    outlet?: string;
    supplier?: string;
    groupBy?: 'day' | 'month' | 'supplier';
}
