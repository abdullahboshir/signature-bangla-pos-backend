import { Schema, model } from "mongoose";
import type { IStoreFinanceDocument, IStoreFinanceModel } from "./store-finance.interface.js";

const storeFinanceSchema = new Schema<IStoreFinanceDocument, IStoreFinanceModel>({
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, unique: true },
  
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
storeFinanceSchema.index({ store: 1 });
storeFinanceSchema.index({ 'transactions.date': -1 });
storeFinanceSchema.index({ 'transactions.status': 1 });
storeFinanceSchema.index({ 'payouts.date': -1 });
storeFinanceSchema.index({ 'reportingPeriod.startDate': 1, 'reportingPeriod.endDate': 1 });

// ==================== VIRTUAL PROPERTIES ====================
storeFinanceSchema.virtual('netRevenue').get(function() {
  return this.revenue.totalRevenue - this.commissions.totalCommissions;
});

storeFinanceSchema.virtual('grossProfit').get(function() {
  return this.revenue.totalRevenue - this.expenses.productCosts - this.expenses.shippingCosts;
});

storeFinanceSchema.virtual('netProfit').get(function() {
  return this.grossProfit - this.expenses.totalExpenses - this.commissions.totalCommissions;
});

storeFinanceSchema.virtual('profitMargin').get(function() {
  return this.revenue.totalRevenue > 0 ? (this.netProfit / this.revenue.totalRevenue) * 100 : 0;
});

storeFinanceSchema.virtual('availableForPayout').get(function() {
  return this.balance.available;
});

// ==================== INSTANCE METHODS ====================
// storeFinanceSchema.methods.addTransaction = async function(
//   transaction: Omit<IStoreFinance['transactions'][0], 'date'>
// ): Promise<void> {
//   const newTransaction = {
//     ...transaction,
//     date: new Date()
//   };

//   this.transactions.push(newTransaction);

//   // Update balances based on transaction type and status
//   if (newTransaction.status === 'completed') {
//     await this.updateBalanceBasedOnTransaction(newTransaction);
//   }

//   await this.calculateFinancialMetrics();
//   await this.save();
// };

// storeFinanceSchema.methods.processPayout = async function(
//   amount: number, 
//   method: string
// ): Promise<boolean> {
//   if (amount > this.balance.available || amount <= 0) {
//     return false;
//   }

//   const payoutFees = this.calculatePayoutFees(amount, method);
//   const netAmount = amount - payoutFees;

//   // Create payout record
//   this.payouts.push({
//     date: new Date(),
//     amount: amount,
//     method: method as any,
//     status: 'pending',
//     referenceId: `PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//     fees: payoutFees,
//     netAmount: netAmount
//   });

//   // Reserve the amount
//   this.balance.available -= amount;
//   this.balance.reserved += amount;

//   await this.save();
//   return true;
// };

// storeFinanceSchema.methods.updateBalance = async function(
//   amount: number, 
//   type: "credit" | "debit"
// ): Promise<void> {
//   if (type === 'credit') {
//     this.balance.available += amount;
//     this.balance.totalEarnings += amount;
//   } else {
//     this.balance.available = Math.max(0, this.balance.available - amount);
//   }
  
//   this.balance.currentBalance = this.balance.available - this.balance.reserved;
//   await this.save();
// };

// storeFinanceSchema.methods.calculateCommissions = function(orderAmount: number): number {
//   const platformCommission = orderAmount * (this.commissions.platformCommission / 100);
//   const paymentProcessing = orderAmount * (this.commissions.paymentProcessingRate / 100);
//   const transactionFees = this.commissions.transactionFees;
  
//   return platformCommission + paymentProcessing + transactionFees;
// };

// storeFinanceSchema.methods.generateFinancialReport = async function(
//   startDate: Date, 
//   endDate: Date
// ): Promise<any> {
//   const transactionsInPeriod = this.transactions.filter(t => 
//     t.date >= startDate && t.date <= endDate && t.status === 'completed'
//   );

//   const revenue = transactionsInPeriod
//     .filter(t => t.type === 'sale')
//     .reduce((sum, t) => sum + t.amount, 0);

//   const expenses = transactionsInPeriod
//     .filter(t => ['fee', 'commission', 'refund'].includes(t.type))
//     .reduce((sum, t) => sum + Math.abs(t.amount), 0);

//   const netIncome = revenue - expenses;

//   return {
//     period: { startDate, endDate },
//     summary: {
//       totalRevenue: revenue,
//       totalExpenses: expenses,
//       netIncome: netIncome,
//       transactionCount: transactionsInPeriod.length
//     },
//     breakdown: {
//       byType: this.getTransactionBreakdownByType(transactionsInPeriod),
//       byDay: this.getTransactionBreakdownByDay(transactionsInPeriod)
//     }
//   };
// };

// storeFinanceSchema.methods.reconcileTransactions = async function(): Promise<void> {
//   const pendingTransactions = this.transactions.filter(t => t.status === 'pending');
  
//   for (const transaction of pendingTransactions) {
//     // Simulate reconciliation logic
//     // In real implementation, this would check with payment processors
//     if (this.shouldCompleteTransaction(transaction)) {
//       transaction.status = 'completed';
//       await this.updateBalanceBasedOnTransaction(transaction);
//     }
//   }

//   await this.calculateFinancialMetrics();
//   await this.save();
//   this.lastReconciledAt = new Date();
// };

// // ==================== HELPER METHODS ====================
// storeFinanceSchema.methods.updateBalanceBasedOnTransaction = async function(
//   transaction: IStoreFinance['transactions'][0]
// ): Promise<void> {
//   switch (transaction.type) {
//     case 'sale':
//       this.balance.available += transaction.amount;
//       this.balance.totalEarnings += transaction.amount;
//       this.revenue.productSales += transaction.amount;
//       this.revenue.totalRevenue += transaction.amount;
//       break;
      
//     case 'refund':
//       this.balance.available = Math.max(0, this.balance.available - Math.abs(transaction.amount));
//       break;
      
//     case 'commission':
//     case 'fee':
//       this.commissions.totalCommissions += Math.abs(transaction.amount);
//       break;
      
//     case 'payout':
//       this.balance.reserved = Math.max(0, this.balance.reserved - Math.abs(transaction.amount));
//       this.balance.totalPayouts += Math.abs(transaction.amount);
//       break;
//   }

//   this.balance.currentBalance = this.balance.available - this.balance.reserved;
// };

// storeFinanceSchema.methods.calculatePayoutFees = function(amount: number, method: string): number {
//   const feeRates: { [key: string]: number } = {
//     bank_transfer: 15, // Flat fee in BDT
//     mobile_banking: 5, // Flat fee in BDT
//     digital_wallet: 1 // Percentage
//   };

//   const rate = feeRates[method] || 0;
//   return method === 'digital_wallet' ? amount * (rate / 100) : rate;
// };

// storeFinanceSchema.methods.calculateFinancialMetrics = async function(): Promise<void> {
//   // Calculate gross profit
//   this.metrics.grossProfit = this.revenue.totalRevenue - this.expenses.productCosts - this.expenses.shippingCosts;
  
//   // Calculate net profit
//   this.metrics.netProfit = this.metrics.grossProfit - this.expenses.totalExpenses - this.commissions.totalCommissions;
  
//   // Calculate profit margin
//   this.metrics.profitMargin = this.revenue.totalRevenue > 0 
//     ? (this.metrics.netProfit / this.revenue.totalRevenue) * 100 
//     : 0;
  
//   // Calculate cash flow (simplified)
//   this.metrics.cashFlow = this.balance.available - this.balance.reserved;
// };

// storeFinanceSchema.methods.shouldCompleteTransaction = function(transaction: any): boolean {
//   // Simple logic - in real app, this would integrate with payment processors
//   return Math.random() > 0.1; // 90% success rate for demo
// };

// storeFinanceSchema.methods.getTransactionBreakdownByType = function(transactions: any[]): any {
//   const breakdown: { [key: string]: number } = {};
  
//   transactions.forEach(transaction => {
//     breakdown[transaction.type] = (breakdown[transaction.type] || 0) + transaction.amount;
//   });
  
//   return breakdown;
// };

// storeFinanceSchema.methods.getTransactionBreakdownByDay = function(transactions: any[]): any {
//   const breakdown: { [key: string]: number } = {};
  
//   transactions.forEach(transaction => {
//     const date = transaction.date.toISOString().split('T')[0];
//     breakdown[date] = (breakdown[date] || 0) + transaction.amount;
//   });
  
//   return breakdown;
// };

// // ==================== STATIC METHODS ====================
// storeFinanceSchema.statics.processScheduledPayouts = async function(): Promise<any> {
//   const stores = await this.find({
//     'settings.autoPayout': true,
//     'balance.available': { $gte: '$settings.payoutThreshold' }
//   }).populate('store');

//   const payoutResults = [];

//   for (const storeFinance of stores) {
//     const payoutAmount = storeFinance.balance.available;
    
//     if (payoutAmount >= storeFinance.settings.payoutThreshold) {
//       const success = await storeFinance.processPayout(
//         payoutAmount, 
//         storeFinance.settings.payoutMethod
//       );
      
//       payoutResults.push({
//         storeId: storeFinance.store._id,
//         amount: payoutAmount,
//         method: storeFinance.settings.payoutMethod,
//         success: success
//       });
//     }
//   }

//   return payoutResults;
// };

// storeFinanceSchema.statics.generateStoreFinancialReport = async function(
//   storeId: Types.ObjectId, 
//   period: string
// ): Promise<any> {
//   const storeFinance = await this.findOne({ store: storeId });
//   if (!storeFinance) return null;

//   const endDate = new Date();
//   let startDate = new Date();

//   switch (period) {
//     case 'weekly':
//       startDate.setDate(endDate.getDate() - 7);
//       break;
//     case 'monthly':
//       startDate.setMonth(endDate.getMonth() - 1);
//       break;
//     case 'quarterly':
//       startDate.setMonth(endDate.getMonth() - 3);
//       break;
//     case 'yearly':
//       startDate.setFullYear(endDate.getFullYear() - 1);
//       break;
//   }

//   return storeFinance.generateFinancialReport(startDate, endDate);
// };

// storeFinanceSchema.statics.calculatePlatformRevenue = async function(
//   startDate: Date, 
//   endDate: Date
// ): Promise<any> {
//   return this.aggregate([
//     {
//       $match: {
//         'transactions.date': { $gte: startDate, $lte: endDate },
//         'transactions.status': 'completed'
//       }
//     },
//     { $unwind: '$transactions' },
//     {
//       $match: {
//         'transactions.date': { $gte: startDate, $lte: endDate },
//         'transactions.type': { $in: ['commission', 'fee'] }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalPlatformRevenue: { $sum: '$transactions.amount' },
//         storeCount: { $addToSet: '$store' },
//         transactionCount: { $sum: 1 }
//       }
//     },
//     {
//       $project: {
//         totalPlatformRevenue: 1,
//         storeCount: { $size: '$storeCount' },
//         transactionCount: 1,
//         averageRevenuePerStore: { $divide: ['$totalPlatformRevenue', { $size: '$storeCount' }] }
//       }
//     }
//   ]);
// };

export const StoreFinance = model<IStoreFinanceDocument, IStoreFinanceModel>('StoreFinance', storeFinanceSchema);