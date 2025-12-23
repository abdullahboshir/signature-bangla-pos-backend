import { SystemSettings } from "./system-settings.model.js";
import type { ISystemSettings } from "./system-settings.interface.js";

const getSystemSettings = async () => {
    return await SystemSettings.getSettings();
};

const updateSystemSettings = async (payload: Partial<ISystemSettings>) => {
    const settings = await SystemSettings.getSettings();

    if (payload.softDeleteRetentionDays) {
        settings.softDeleteRetentionDays = payload.softDeleteRetentionDays;
    }

    await settings.save();
    return settings;
};

export const SystemSettingsService = {
    getSystemSettings,
    updateSystemSettings
};
