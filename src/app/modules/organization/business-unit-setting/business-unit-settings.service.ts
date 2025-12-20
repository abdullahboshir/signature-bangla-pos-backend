import { BusinessUnitSettings } from "./business-unit-settings.model.js";


export const getSettingsService = async (businessUnitId: string) => {
    let settings = await BusinessUnitSettings.findOne({ businessUnit: businessUnitId });

    if (!settings) {
        // Create default settings if not exists
        const defaults = (BusinessUnitSettings as any).getDefaultSettings();
        settings = await BusinessUnitSettings.create({
            businessUnit: businessUnitId,
            ...defaults
        });
    }
    return settings;
};

export const updateSettingsService = async (businessUnitId: string, payload: any) => {
    const settings = await BusinessUnitSettings.findOneAndUpdate(
        { businessUnit: businessUnitId },
        payload,
        { new: true, runValidators: true, upsert: true } // Upsert ensures creation if missing during update too
    );
    return settings;
};
