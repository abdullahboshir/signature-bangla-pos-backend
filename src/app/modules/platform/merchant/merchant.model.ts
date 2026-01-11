import { Schema, model } from "mongoose";
import type { IMerchant } from "./merchant.interface.js";
import { cachingMiddleware } from "@core/utils/cacheQuery.ts";

const MerchantSchema = new Schema<IMerchant>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    profileImage: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        sparse: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    nidNumber: {
        type: String,
        trim: true
    },
    tinNumber: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
MerchantSchema.index({ user: 1 });
MerchantSchema.index({ phone: 1 }, { sparse: true });
MerchantSchema.index({ isActive: 1 });
MerchantSchema.index({ isDeleted: 1 });

// Virtual for fullName
MerchantSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName || ''}`.trim();
});

cachingMiddleware(MerchantSchema);

export const Merchant = model<IMerchant>('Merchant', MerchantSchema);
