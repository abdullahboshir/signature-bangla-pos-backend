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
            isRetentionPolicyEnabled: true
        });
    }
    return settings;
};

export const SystemSettings = model<ISystemSettingsDocument, ISystemSettingsModel>('SystemSettings', systemSettingsSchema);
