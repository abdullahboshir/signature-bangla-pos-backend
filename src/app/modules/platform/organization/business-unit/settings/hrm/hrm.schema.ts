import { Schema } from "mongoose";

export const hrmSettingsSchema = new Schema({
    attendance: {
        enableBiometric: { type: Boolean, default: false },
        gracePeriodMinutes: { type: Number, default: 15 },
        overtimeCalculation: { type: Boolean, default: true },
        workDays: {
            type: [String],
            enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            default: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
        }
    },
    payroll: {
        currency: { type: String, default: 'BDT' },
        autoGenerate: { type: Boolean, default: false },
        payCycle: { type: String, enum: ['monthly', 'weekly'], default: 'monthly' }
    },
    leave: {
        annualLeaveDays: { type: Number, default: 14 },
        sickLeaveDays: { type: Number, default: 10 },
        casualLeaveDays: { type: Number, default: 10 },
        carryForwardLimit: { type: Number, default: 5 }
    }
}, { _id: false });
