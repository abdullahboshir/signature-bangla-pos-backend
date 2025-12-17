import { Document, Types } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
export type PaymentStatus = "pending" | "paid" | "partial" | "refunded" | "failed";
export type PaymentMethod = "cash" | "card" | "mobile_banking" | "bank_transfer" | "credit";

export interface IOrderItem {
    product: Types.ObjectId;
    variant?: string;
    quantity: number;
    price: number;
    total: number;
    discount?: number;
}

export interface IOrder extends Document {
    orderId: string;
    customer?: Types.ObjectId; // Optional for walk-in customers
    businessUnit: Types.ObjectId;

    items: IOrderItem[];

    subTotal: number;
    discount: number;
    tax: number;
    shippingCost: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;

    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;

    shippingAddress?: {
        street: string;
        city: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };

    billingAddress?: {
        street: string;
        city: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };

    notes?: string;
    createdBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}
