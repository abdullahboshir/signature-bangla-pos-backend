import { Schema, model, Types, Document } from 'mongoose';

export interface IStockLedger extends Document {
    date: Date;
    product: Types.ObjectId;
    outlet?: Types.ObjectId;
    type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'initial';
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

export const StockLedger = model<IStockLedger>('StockLedger', stockLedgerSchema);
