import { Schema } from "mongoose";

export const posSettingsSchema = new Schema({
    defaultCustomer: { type: Schema.Types.Mixed, default: "walk-in" },
    disableSuspend: { type: Boolean, default: false },
    enableCredit: { type: Boolean, default: false },
    receiptLayout: { type: String, enum: ["simple", "detailed", "thermal"], default: "thermal" },
    soundEffects: { type: Boolean, default: true },
    receiptHeader: { type: String },
    receiptFooter: { type: String },
    showLogo: { type: Boolean, default: true },
    logoPosition: { type: String, enum: ["top", "bottom"], default: "top" }
}, { _id: false });
