import { Schema, model, Types, Document } from 'mongoose';
import { contextScopePlugin } from '@core/plugins/context-scope.plugin.js';

export interface IStockLedger extends Document {
    date: Date;
    product: Types.ObjectId;
    outlet?: Types.ObjectId;
    type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'initial';
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    quantity: number; // Positive for IN, Negative for OUT
    reference?: string; // ID of the related document (Purchase ID, Order ID, etc.)
    referenceType?: 'Purchase' | 'Order' | 'InventoryAdjustment' | 'Transfer';
    balanceAfter?: number; // Snapshot of stock level after transaction
    remarks?: string;
}

const stockLedgerSchema = new Schema<IStockLedger>({
    date: { type: Date, default: Date.now },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    type: {
        type: String,
        enum: ['purchase', 'sale', 'adjustment', 'transfer', 'return', 'initial'],
        required: true
    },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        required: true,
        index: true
    },
    quantity: { type: Number, required: true },
    reference: { type: String },
    referenceType: {
        type: String,
        enum: ['Purchase', 'Order', 'InventoryAdjustment', 'Transfer']
    },
    balanceAfter: { type: Number },
    remarks: { type: String }
}, {
    timestamps: true
});

stockLedgerSchema.index({ product: 1, date: -1 });
stockLedgerSchema.index({ outlet: 1, date: -1 });
stockLedgerSchema.index({ type: 1 });
stockLedgerSchema.index({ reference: 1 });

// Apply Context-Aware Data Isolation
stockLedgerSchema.plugin(contextScopePlugin, {
    outletField: 'outlet'
});

export const StockLedger = model<IStockLedger>('StockLedger', stockLedgerSchema);
