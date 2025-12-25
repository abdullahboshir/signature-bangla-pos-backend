export interface IProfitLossStatement {
    revenue: number; // Total Sales Amount
    cogs: number; // Cost of Goods Sold
    grossProfit: number; // Revenue - COGS
    expenses: number; // Total Operational Expenses
    netProfit: number; // Gross Profit - Expenses

    // Breakdown
    expenseBreakdown: { category: string; amount: number }[];
}

export interface IProfitLossFilters {
    startDate: string; // Required for P&L to be meaningful
    endDate: string; // Required
    businessUnit?: string;
    outlet?: string;
}
