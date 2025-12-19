import { StoreSettings } from "./business-unit-settings.model.js";
import AppError from "@shared/errors/app-error.js";
import { Types } from "mongoose";

export const getSettingsService = async (businessUnitId: string) => {
    let settings = await StoreSettings.findOne({ store: businessUnitId });

    if (!settings) {
        // Create default settings if not exists
        settings = await StoreSettings.create({
            store: businessUnitId,
            // Default values are handled by schema defaults
        });
    }
    return settings;
};

export const updateSettingsService = async (businessUnitId: string, payload: any) => {
    const settings = await StoreSettings.findOneAndUpdate(
        { store: businessUnitId },
        payload,
        { new: true, runValidators: true, upsert: true } // Upsert ensures creation if missing during update too
    );
    return settings;
};
