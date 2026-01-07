import { SystemSettings } from '../settings/system-settings/system-settings.model';
import { CompanySettings } from '../organization/company/settings/settings.model';
import { BusinessUnitSettings } from '../organization/business-unit/settings/settings.model';
import { OutletSettings } from '../organization/outlet/settings/settings.model';
import { Outlet } from '../organization/outlet/outlet.model';
import _ from 'lodash'; // lodash.get is useful for dot notation

/**
 * Resolves a setting value by checking hierarchy:
 * 1. Outlet (Highest priority)
 * 2. Business Unit
 * 3. Company
 * 4. System (Default) - via explicit fallback or hardcoded
 */
const resolveSetting = async (key: string, context: { outletId?: string; businessUnitId?: string; companyId?: string }, defaultValue?: any) => {
    let outletSettings, buSettings, companySettings, systemSettings;

    // 1. Outlet Level
    if (context.outletId) {
        outletSettings = await OutletSettings.findOne({ outlet: context.outletId }).lean();
        const startValue = _.get(outletSettings, key);
        if (startValue !== undefined && startValue !== null) return startValue;

        // If context didn't provide parents, we might need to fetch them from Outlet
        if (!context.businessUnitId) {
            const outlet = await Outlet.findById(context.outletId);
            if (outlet) context.businessUnitId = outlet.businessUnit.toString();
        }
    }

    // 2. Business Unit Level
    if (context.businessUnitId) {
        buSettings = await BusinessUnitSettings.findOne({ businessUnit: context.businessUnitId }).lean();
        const medValue = _.get(buSettings, key);
        if (medValue !== undefined && medValue !== null) return medValue;

        // Fetch Company ID from BU if missing (Implementation pending BU->Company link check)
        // For now relying on context
    }

    // 3. Company Level
    if (context.companyId) {
        companySettings = await CompanySettings.findOne({ company: context.companyId }).lean();
        const highValue = _.get(companySettings, key);
        if (highValue !== undefined && highValue !== null) return highValue;
    }

    // 4. System Level
    // systemSettings = await SystemSettings.getSettings(); // Assuming getSettings static exists and works
    // const globalValue = _.get(systemSettings, key);
    // if (globalValue !== undefined && globalValue !== null) return globalValue;

    return defaultValue;
};

export const SettingsResolutionService = {
    resolveSetting
};
