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
    outlet: { type: Schema.Types.ObjectId as any, ref: 'Outlet', required: true },
    status: { type: String, enum: ['pending', 'ordered', 'received'], default: 'pending' },
    items: [PurchaseItemSchema],
    subTotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'mobile_banking', 'cheque', 'credit'] },
    paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    notes: { type: String },
    attachment: { type: String },
    createdBy: { type: Schema.Types.ObjectId as any, ref: 'User' }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            delete (ret as any)._id;
            delete (ret as any).__v;
        }
    }
});

// Indexes for Reports & Dashboards
PurchaseSchema.index({ businessUnit: 1, purchaseDate: -1 });
PurchaseSchema.index({ supplier: 1, purchaseDate: -1 });
PurchaseSchema.index({ outlet: 1, status: 1 });
PurchaseSchema.index({ status: 1 });
PurchaseSchema.index({ paymentStatus: 1 });

export const Purchase = model<IPurchase>('Purchase', PurchaseSchema);
