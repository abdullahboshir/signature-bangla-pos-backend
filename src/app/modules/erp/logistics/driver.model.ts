import { Schema, model } from "mongoose";

export interface IDriver {
    user: Schema.Types.ObjectId; // Link to User/Staff
    licenseNumber: string;
    licenseExpiry: Date;
    vehicle?: Schema.Types.ObjectId;
    rating: number;
    totalTrips: number;

    // Module: 'logistics' (Heavy Duty) vs 'pos' (Delivery Boy)
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';

    businessUnit: Schema.Types.ObjectId;
    isActive: boolean;
}

const driverSchema = new Schema<IDriver>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    licenseNumber: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    rating: { type: Number, default: 5 },
    totalTrips: { type: Number, default: 0 },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'logistics',
        required: true,
        index: true
    },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

driverSchema.index({ user: 1 }, { unique: true });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ module: 1 });

export const Driver = model<IDriver>('Driver', driverSchema);
