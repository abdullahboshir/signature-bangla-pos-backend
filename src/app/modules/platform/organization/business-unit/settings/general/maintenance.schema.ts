import { Schema } from "mongoose";

export const maintenanceSettingsSchema = new Schema({
    enableMaintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String },
    allowAdmins: { type: Boolean, default: true },
    scheduledMaintenance: {
        start: { type: Date },
        end: { type: Date },
        message: { type: String }
    }
}, { _id: false });
