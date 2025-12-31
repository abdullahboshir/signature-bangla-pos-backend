import BusinessUnit from "../core/business-unit.model.js";
import { BusinessUnitSettings } from "./settings.model.js";

import { Types } from "mongoose";

// Helper to resolve ID or Slug
const resolveBusinessUnitId = async (idOrSlug: string): Promise<string> => {
    if (Types.ObjectId.isValid(idOrSlug)) {
        return idOrSlug;
    }
    // Try to find by slug
    const bu = await BusinessUnit.findOne({ slug: idOrSlug }).select('_id');
    if (!bu) {
        throw new Error(`Business Unit not found for: ${idOrSlug}`);
    }
    return (bu._id as any).toString();
};

export const getSettingsService = async (businessUnitInput: string) => {
    const businessUnitId = await resolveBusinessUnitId(businessUnitInput);
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

export const updateSettingsService = async (businessUnitInput: string, payload: any) => {
    const businessUnitId = await resolveBusinessUnitId(businessUnitInput);
    const settings = await BusinessUnitSettings.findOneAndUpdate(
        { businessUnit: businessUnitId },
        payload,
        { new: true, runValidators: true, upsert: true } // Upsert ensures creation if missing during update too
    );
    return settings;
};
