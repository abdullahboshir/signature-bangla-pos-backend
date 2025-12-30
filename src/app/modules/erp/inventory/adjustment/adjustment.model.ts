import { Schema, model, Types, Document } from 'mongoose';

export interface IAdjustmentItem {
    product: Types.ObjectId;
    type: 'increase' | 'decrease';
    quantity: number;
    reason: string;
}

export interface IInventoryAdjustment extends Document {
    date: Date;
    referenceNo: string;
    outlet?: Types.ObjectId; // If null, global adjustment
    items: IAdjustmentItem[];
    adjustedBy: Types.ObjectId; // User ID
    status: 'completed' | 'pending';
    note?: string;
}

const adjustmentItemSchema = new Schema<IAdjustmentItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['increase', 'decrease'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true }
}, { _id: false });

const inventoryAdjustmentSchema = new Schema<IInventoryAdjustment>({
    date: { type: Date, default: Date.now },
    referenceNo: { type: String, required: true, unique: true },
    outlet: { type: Schema.Types.ObjectId, ref: 'Outlet' },
    items: [adjustmentItemSchema],
    adjustedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['completed', 'pending'], default: 'completed' },
    note: { type: String }
}, {
    timestamps: true
});

inventoryAdjustmentSchema.index({ outlet: 1, date: -1 });
inventoryAdjustmentSchema.index({ status: 1 });
inventoryAdjustmentSchema.index({ 'items.product': 1 });

export const InventoryAdjustment = model<IInventoryAdjustment>('InventoryAdjustment', inventoryAdjustmentSchema);
