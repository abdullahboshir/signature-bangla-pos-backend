import { OrganizationSettings } from './settings.model.js';
import { type IOrganizationSettings } from './settings.interface.js';

const getSettings = async (organizationId: string): Promise<IOrganizationSettings | null> => {
    let settings = await OrganizationSettings.findOne({ organization: organizationId });
    if (!settings) {
        // Safe Default: Create one if missing (Lazy Initialization)
        settings = await OrganizationSettings.create({ organization: organizationId });
    }
    return settings;
};

const updateSettings = async (organizationId: string, payload: Partial<IOrganizationSettings>): Promise<IOrganizationSettings | null> => {
    const settings = await OrganizationSettings.findOneAndUpdate(
        { organization: organizationId },
        payload,
        { new: true, upsert: true } // Create if not exists
    );
    return settings;
};

export const OrganizationSettingsService = {
    getSettings,
    updateSettings
};
