import { Schema, model } from 'mongoose';
import type { IPurchase } from './purchase.interface.ts';

const PurchaseItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId as any, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    total: { type: Number, required: true }
});

const PurchaseSchema = new Schema<IPurchase>({
    id: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId as any, ref: 'Supplier', required: true },
    purchaseDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date },
    referenceNo: { type: String },
    businessUnit: { type: Schema.Types.ObjectId as any, ref: 'BusinessUnit', required: true },
    status: { type: String, enum: ['pending', 'ordered', 'received'], default: 'pending' },
    items: [PurchaseItemSchema],
    subTotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    notes: { type: String }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete (ret as any)._id;
            delete (ret as any).__v;
        }
    }
});

export const Purchase = model<IPurchase>('Purchase', PurchaseSchema);
