import { Schema, model } from "mongoose";
import type { ISystemSettingsDocument, ISystemSettingsModel } from "./system-settings.interface.js";

const systemSettingsSchema = new Schema<ISystemSettingsDocument, ISystemSettingsModel>({
    softDeleteRetentionDays: {
        type: Number,
        default: 365,
        min: 1
    },
    isRetentionPolicyEnabled: {
        type: Boolean,
        default: true
    },
    licenseKey: {
        type: String,
        default: null,
        select: false
    },
    enabledModules: {
        pos: { type: Boolean, default: true },
        erp: { type: Boolean, default: true },
        hrm: { type: Boolean, default: true },
        ecommerce: { type: Boolean, default: true },
        crm: { type: Boolean, default: true },
        logistics: { type: Boolean, default: true },
        finance: { type: Boolean, default: true },
        marketing: { type: Boolean, default: true },
        integrations: { type: Boolean, default: true },
        governance: { type: Boolean, default: false },
        saas: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Static method to get or create settings
systemSettingsSchema.statics['getSettings'] = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            softDeleteRetentionDays: 365,
            isRetentionPolicyEnabled: true,
            licenseKey: null,
            enabledModules: {
                pos: true,
                erp: true,
                hrm: true,
                ecommerce: true,
                crm: true,
                logistics: true,
                finance: true,
                marketing: true,
                integrations: true,
                governance: false,
                saas: true
            }
        });
    }
    return settings;
};

export const SystemSettings = model<ISystemSettingsDocument, ISystemSettingsModel>('SystemSettings', systemSettingsSchema);
