import type { IOutletSettings } from './settings.interface.ts';
import { OutletSettings } from './settings.model.ts';


const getSettings = async (outletId: string): Promise<IOutletSettings | null> => {
    let settings = await OutletSettings.findOne({ outlet: outletId });
    if (!settings) {
        settings = await OutletSettings.create({ outlet: outletId });
    }
    return settings;
};

const updateSettings = async (outletId: string, payload: Partial<IOutletSettings>): Promise<IOutletSettings | null> => {
    const settings = await OutletSettings.findOneAndUpdate(
        { outlet: outletId },
        payload,
        { new: true, upsert: true }
    );
    return settings;
};

export const OutletSettingsService = {
    getSettings,
    updateSettings
};
