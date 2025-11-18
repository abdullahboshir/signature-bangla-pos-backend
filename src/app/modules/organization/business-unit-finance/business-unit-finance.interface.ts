import type { Document, Model, Types } from "mongoose";

export interface IStoreFinance {
  store: Types.ObjectId;
  
  // Balance Information
  balance: {
    available: number;
    pending: number;
    reserved: number;
    totalEarnings: number;
    totalPayouts: number;
    currentBalance: number;
  };
  
  // Revenue Breakdown
  revenue: {
    productSales: number;
    shippingFees: number;
    taxCollected: number;
    giftCardSales: number;
    serviceFees: number;
    totalRevenue: number;
  };
  
  // Expenses Breakdown
  expenses: {
    productCosts: number;
    shippingCosts: number;
    platformFees: number;
    paymentProcessing: number;
    marketing: number;
    operational: number;
    totalExpenses: number;
  };
  
  // Commission & Fees
  commissions: {
    platformCommission: number;
    paymentProcessingRate: number;
    transactionFees: number;
    monthlySubscription?: number;
    additionalFees: number;
    totalCommissions: number;
  };
  
  // Transactions
  transactions: {
    date: Date;
    type: "sale" | "refund" | "payout" | "fee" | "adjustment" | "commission";
    amount: number;
    orderId?: Types.ObjectId;
    description: string;
    status: "pending" | "completed" | "failed" | "cancelled";
    referenceId: string;
    metadata?: any;
  }[];
  
  // Payout Information
  payouts: {
    date: Date;
    amount: number;
    method: "bank_transfer" | "mobile_banking" | "digital_wallet";
    status: "pending" | "processed" | "failed";
    referenceId: string;
    fees: number;
    netAmount: number;
  }[];
  
  // Tax Information
  tax: {
    collected: number;
    paid: number;
    filingFrequency: "monthly" | "quarterly" | "annually";
    lastFiled?: Date;
    nextFiling?: Date;
    taxId?: string;
  };
  
  // Financial Settings
  settings: {
    autoPayout: boolean;
    payoutThreshold: number;
    payoutSchedule: "daily" | "weekly" | "bi-weekly" | "monthly";
    payoutMethod: "bank_transfer" | "mobile_banking" | "digital_wallet";
    taxInclusive: boolean;
    currency: "BDT" | "USD";
    decimalPlaces: number;
  };
  
  // Financial Metrics
  metrics: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    returnOnInvestment: number;
    cashFlow: number;
  };
  
  // Reporting Period
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  };
  
  createdAt: Date;
  updatedAt: Date;
  lastReconciledAt?: Date;
}

export type IStoreFinanceDocument = IStoreFinance & Document & {
  // Computed Properties
  netRevenue: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  availableForPayout: number;
  
  // Methods
  addTransaction(transaction: Omit<IStoreFinance['transactions'][0], 'date'>): Promise<void>;
  processPayout(amount: number, method: string): Promise<boolean>;
  updateBalance(amount: number, type: "credit" | "debit"): Promise<void>;
  calculateCommissions(orderAmount: number): number;
  generateFinancialReport(startDate: Date, endDate: Date): Promise<any>;
  reconcileTransactions(): Promise<void>;
};

export interface IStoreFinanceModel extends Model<IStoreFinanceDocument> {
  // Static Methods
  processScheduledPayouts(): Promise<any>;
  generateStoreFinancialReport(storeId: Types.ObjectId, period: string): Promise<any>;
  calculatePlatformRevenue(startDate: Date, endDate: Date): Promise<any>;
}