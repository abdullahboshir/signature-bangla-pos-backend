import { SystemSettings } from '../settings/system-settings/system-settings.model.js';
import { PlatformSettings } from '../settings/platform-settings/platform-settings.model.js';
import { OrganizationSettings } from '../organization/settings/settings.model.js';
import { BusinessUnitSettings } from '../organization/business-unit/settings/settings.model.js';
import { OutletSettings } from '../organization/outlet/settings/settings.model.js';
import { Outlet } from '../organization/outlet/outlet.model.js';
import _ from 'lodash';

/**
 * Resolves a setting value by checking hierarchy:
 * 1. Outlet (Highest priority)
 * 2. Business Unit
 * 3. Organization
 * 4. Platform (Business Defaults)
 * 5. System (Infrastructure/Technical)
 */
const resolveSetting = async (key: string, context: { outletId?: string; businessUnitId?: string; organizationId?: string }, defaultValue?: any) => {
    // 1. Outlet Level
    if (context.outletId) {
        const outletSettings = await OutletSettings.findOne({ outlet: context.outletId }).lean();
        const value = _.get(outletSettings, key);
        if (value !== undefined && value !== null) return value;

        if (!context.businessUnitId) {
            const outlet = await Outlet.findById(context.outletId).lean();
            if (outlet) context.businessUnitId = outlet.businessUnit.toString();
        }
    }

    // 2. Business Unit Level
    if (context.businessUnitId) {
        const buSettings = await BusinessUnitSettings.findOne({ businessUnit: context.businessUnitId }).lean();
        const value = _.get(buSettings, key);
        if (value !== undefined && value !== null) return value;
    }

    // 3. Organization Level
    if (context.organizationId) {
        const organizationSettings = await OrganizationSettings.findOne({ organization: context.organizationId }).lean();
        const value = _.get(organizationSettings, key);
        if (value !== undefined && value !== null) return value;
    }

    // 4. Platform Level (Business Defaults)
    const platformSettings = await PlatformSettings.getSettings();
    const platformValue = _.get(platformSettings, key);
    if (platformValue !== undefined && platformValue !== null) return platformValue;

    // 5. System Level (Technical)
    const systemSettings = await SystemSettings.getSettings();
    const systemValue = _.get(systemSettings, key);
    if (systemValue !== undefined && systemValue !== null) return systemValue;

    return defaultValue;
};

export const SettingsResolutionService = {
    resolveSetting
};

