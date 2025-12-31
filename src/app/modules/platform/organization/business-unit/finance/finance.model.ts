import { Schema, model } from "mongoose";
import type { IBusinessUnitFinanceDocument, IBusinessUnitFinanceModel } from "./finance.interface.js";

const businessUnitFinanceSchema = new Schema<IBusinessUnitFinanceDocument, IBusinessUnitFinanceModel>({
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, unique: true },

  // Balance Information
  balance: {
    available: { type: Number, default: 0, min: 0 },
    pending: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    totalPayouts: { type: Number, default: 0, min: 0 },
    currentBalance: { type: Number, default: 0 }
  },

  // Revenue Breakdown
  revenue: {
    productSales: { type: Number, default: 0, min: 0 },
    shippingFees: { type: Number, default: 0, min: 0 },
    taxCollected: { type: Number, default: 0, min: 0 },
    giftCardSales: { type: Number, default: 0, min: 0 },
    serviceFees: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 }
  },

  // Expenses Breakdown
  expenses: {
    productCosts: { type: Number, default: 0, min: 0 },
    shippingCosts: { type: Number, default: 0, min: 0 },
    platformFees: { type: Number, default: 0, min: 0 },
    paymentProcessing: { type: Number, default: 0, min: 0 },
    marketing: { type: Number, default: 0, min: 0 },
    operational: { type: Number, default: 0, min: 0 },
    totalExpenses: { type: Number, default: 0, min: 0 }
  },

  // Commission & Fees
  commissions: {
    platformCommission: { type: Number, default: 10, min: 0, max: 100 }, // Percentage
    paymentProcessingRate: { type: Number, default: 2.9, min: 0, max: 100 }, // Percentage
    transactionFees: { type: Number, default: 0, min: 0 },
    monthlySubscription: { type: Number, default: 0, min: 0 },
    additionalFees: { type: Number, default: 0, min: 0 },
    totalCommissions: { type: Number, default: 0, min: 0 }
  },

  // Transactions
  transactions: [{
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["sale", "refund", "payout", "fee", "adjustment", "commission"],
      required: true
    },
    amount: { type: Number, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending"
    },
    referenceId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }
  }],

  // Payout Information
  payouts: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["bank_transfer", "mobile_banking", "digital_wallet"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending"
    },
    referenceId: { type: String, required: true },
    fees: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, required: true, min: 0 }
  }],

  // Tax Information
  tax: {
    collected: { type: Number, default: 0, min: 0 },
    paid: { type: Number, default: 0, min: 0 },
    filingFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "annually"],
      default: "monthly"
    },
    lastFiled: { type: Date },
    nextFiling: { type: Date },
    taxId: { type: String }
  },

  // Financial Settings
  settings: {
    autoPayout: { type: Boolean, default: false },
    payoutThreshold: { type: Number, default: 1000, min: 0 },
    payoutSchedule: {
      type: String,
      enum: ["daily", "weekly", "bi-weekly", "monthly"],
      default: "weekly"
    },
    payoutMethod: {
      type: String,
      enum: ["bank_transfer", "mobile_banking", "digital_wallet"],
      default: "bank_transfer"
    },
    taxInclusive: { type: Boolean, default: false },
    currency: {
      type: String,
      enum: ["BDT", "USD"],
      default: "BDT"
    },
    decimalPlaces: { type: Number, default: 2, min: 0, max: 4 }
  },

  // Financial Metrics
  metrics: {
    grossProfit: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0, min: -100, max: 100 },
    averageOrderValue: { type: Number, default: 0, min: 0 },
    customerLifetimeValue: { type: Number, default: 0, min: 0 },
    returnOnInvestment: { type: Number, default: 0 },
    cashFlow: { type: Number, default: 0 }
  },

  // Reporting Period
  reportingPeriod: {
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      default: "monthly"
    }
  },

  lastReconciledAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================
businessUnitFinanceSchema.index({ businessUnit: 1 });
businessUnitFinanceSchema.index({ 'transactions.date': -1 });
businessUnitFinanceSchema.index({ 'transactions.status': 1 });
businessUnitFinanceSchema.index({ 'payouts.date': -1 });
businessUnitFinanceSchema.index({ 'reportingPeriod.startDate': 1, 'reportingPeriod.endDate': 1 });

// ==================== VIRTUAL PROPERTIES ====================
businessUnitFinanceSchema.virtual('netRevenue').get(function () {
  return this.revenue.totalRevenue - this.commissions.totalCommissions;
});

businessUnitFinanceSchema.virtual('grossProfit').get(function () {
  return this.revenue.totalRevenue - this.expenses.productCosts - this.expenses.shippingCosts;
});

businessUnitFinanceSchema.virtual('netProfit').get(function () {
  return this.grossProfit - this.expenses.totalExpenses - this.commissions.totalCommissions;
});

businessUnitFinanceSchema.virtual('profitMargin').get(function () {
  return this.revenue.totalRevenue > 0 ? (this.netProfit / this.revenue.totalRevenue) * 100 : 0;
});

businessUnitFinanceSchema.virtual('availableForPayout').get(function () {
  return this.balance.available;
});


export const BusinessUnitFinance = model<IBusinessUnitFinanceDocument, IBusinessUnitFinanceModel>('BusinessUnitFinance', businessUnitFinanceSchema);