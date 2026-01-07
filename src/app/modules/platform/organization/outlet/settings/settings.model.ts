import { Schema, model } from 'mongoose';
import type { IOutletSettings, IOutletSettingsModel } from './settings.interface.ts';

const outletSettingsSchema = new Schema<IOutletSettings>({
    outlet: {
        type: Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true,
        unique: true
    },
    pos: {
        counterName: { type: String, default: 'Main Counter' },
        isTableManagementEnabled: { type: Boolean, default: false },
        receiptPrinterIp: { type: String }
    },
    operatingHours: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '22:00' }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
});

export const OutletSettings = model<IOutletSettings, IOutletSettingsModel>('OutletSettings', outletSettingsSchema);
