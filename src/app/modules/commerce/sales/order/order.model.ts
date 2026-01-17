import { Schema, model } from "mongoose";
import type { IOrder } from "./order.interface.js";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";


const orderItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: String }, // Can handle specific variant reference if needed
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 }
}, { _id: false });

const orderSchema = new Schema<IOrder>({
    orderId: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    company: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },

    // Origin of the order (POS vs Online)
    sourceModule: {
        type: String,
        enum: ['pos', 'ecommerce', 'crm', 'system'],
        default: 'pos',
        required: true,
        index: true
    },

    items: [orderItemSchema],

    subTotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "partial", "refunded", "failed"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "mobile_banking", "bank_transfer", "credit"],
        default: "cash"
    },

    shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },

    billingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },

    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }

}, {
    versionKey: false,
    timestamps: true
});

// Indexes for Scalability
orderSchema.index({ businessUnit: 1, createdAt: -1 }); // Tenant Dashboard Performance
orderSchema.index({ outlet: 1, status: 1 }); // Outlet Dashboard & Filtering
orderSchema.index({ customer: 1, createdAt: -1 }); // Customer Order History
orderSchema.index({ status: 1 }); // Admin Status Filters
orderSchema.index({ createdBy: 1 }); // Staff Performance

export const Order = model<IOrder>("Order", orderSchema);

// Apply Context-Aware Data Isolation
orderSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit',
    outletField: 'outlet'
});
