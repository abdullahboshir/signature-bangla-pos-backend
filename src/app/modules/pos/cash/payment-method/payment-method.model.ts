import { Schema, model } from "mongoose";

export interface IPaymentMethod {
    name: string; // e.g., "Cash", "Card", "Stripe", "Bkash"
    provider: string; // "cash", "stripe", "sslcommerz"
    type: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer' | 'credit';

    // Module Visibility: Should this method appear in POS or Ecommerce?
    // e.g. "Cash" -> ['pos'], "Stripe" -> ['ecommerce'], "Bkash" -> ['pos', 'ecommerce']
    allowedModules: ('pos' | 'erp' | 'hrm' | 'ecommerce')[];

    credentials?: Map<string, any>; // API Keys
    surcharge?: {
        type: 'percentage' | 'fixed';
        value: number;
    };
    isActive: boolean;
    businessUnit: Schema.Types.ObjectId;
}

const paymentMethodSchema = new Schema<IPaymentMethod>({
    name: { type: String, required: true },
    provider: { type: String, required: true },
    type: {
        type: String,
        enum: ['cash', 'card', 'digital_wallet', 'bank_transfer', 'credit'],
        required: true
    },
    allowedModules: [{
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce'],
        required: true
    }],
    credentials: { type: Map, of: Schema.Types.Mixed, select: false },
    surcharge: {
        type: { type: String, enum: ['percentage', 'fixed'] },
        value: { type: Number }
    },
    isActive: { type: Boolean, default: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true }
}, {
    timestamps: true
});

paymentMethodSchema.index({ businessUnit: 1, isActive: 1 });
paymentMethodSchema.index({ allowedModules: 1 });

export const PaymentMethod = model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);
