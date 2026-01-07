import { Schema } from "mongoose";

export const notificationSettingsSchema = new Schema({
    email: {
        newOrders: { type: Boolean, default: true },
        lowStock: { type: Boolean, default: true },
        newReviews: { type: Boolean, default: true },
        customerQueries: { type: Boolean, default: true }
    },
    push: {
        newOrders: { type: Boolean, default: true },
        importantUpdates: { type: Boolean, default: true }
    },
    sms: {
        orderUpdates: { type: Boolean, default: false },
        securityAlerts: { type: Boolean, default: true }
    }
}, { _id: false });
