import { Schema, model } from "mongoose";

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'FREE_SHIPPING';

export interface IPromotion {
    name: string;
    code: string; // Coupon Code
    description?: string;
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    type: PromotionType;
    value: number; // For percentage or fixed amount
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate: Date;
    endDate: Date;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    businessUnit: Schema.Types.ObjectId;
}

const promotionSchema = new Schema<IPromotion>({
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING'],
        required: true
    },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true }
}, {
    timestamps: true
});

promotionSchema.index({ code: 1, businessUnit: 1 }, { unique: true });
promotionSchema.index({ module: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

export const Promotion = model<IPromotion>('Promotion', promotionSchema);
