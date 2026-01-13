import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IVehicle {
    name: string;
    licensePlate: string;
    type: 'truck' | 'van' | 'bike' | 'scooter';
    capacity: number; // in kg or cbm
    driver?: Schema.Types.ObjectId;
    currentLocation?: { lat: number, lng: number };
    status: 'active' | 'maintenance' | 'busy';

    // Module: 'logistics' (Fleet) vs 'pos' (Local Delivery Bike)
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';

    company: Schema.Types.ObjectId;
    businessUnit: Schema.Types.ObjectId;
    isActive: boolean;
}

const vehicleSchema = new Schema<IVehicle>({
    name: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    capacity: { type: Number },
    driver: { type: Schema.Types.ObjectId, ref: 'Staff' }, // Staff ID
    currentLocation: {
        lat: Number,
        lng: Number
    },
    status: { type: String, enum: ['active', 'maintenance', 'busy'], default: 'active' },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'logistics',
        required: true,
        index: true
    },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

vehicleSchema.index({ licensePlate: 1, businessUnit: 1 }, { unique: true });
vehicleSchema.index({ module: 1 });

export const Vehicle = model<IVehicle>('Vehicle', vehicleSchema);

// Apply Context-Aware Data Isolation
vehicleSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
