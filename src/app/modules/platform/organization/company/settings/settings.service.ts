import { CompanySettings } from './settings.model.ts';
import { type ICompanySettings } from './settings.interface.ts';

const getSettings = async (companyId: string): Promise<ICompanySettings | null> => {
    let settings = await CompanySettings.findOne({ company: companyId });
    if (!settings) {
        // Safe Default: Create one if missing (Lazy Initialization)
        settings = await CompanySettings.create({ company: companyId });
    }
    return settings;
};

const updateSettings = async (companyId: string, payload: Partial<ICompanySettings>): Promise<ICompanySettings | null> => {
    const settings = await CompanySettings.findOneAndUpdate(
        { company: companyId },
        payload,
        { new: true, upsert: true } // Create if not exists
    );
    return settings;
};

export const CompanySettingsService = {
    getSettings,
    updateSettings
};
