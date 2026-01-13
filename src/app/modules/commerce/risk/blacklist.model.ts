import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IBlacklist {
    identifier: string; // Phone number or Email
    type: "phone" | "email" | "ip";
    reason: string;
    riskScore: number;
    addedBy?: Schema.Types.ObjectId;
    businessUnit: Schema.Types.ObjectId;
    isActive: boolean;
}

const blacklistSchema = new Schema<IBlacklist>({
    identifier: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ["phone", "email", "ip"],
        required: true
    },
    reason: { type: String, required: true },
    riskScore: { type: Number, default: 100 }, // 100 = Fully Blocked
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    businessUnit: { type: Schema.Types.ObjectId, ref: "BusinessUnit", required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Ensure unique identifier per business unit
blacklistSchema.index({ identifier: 1, businessUnit: 1 }, { unique: true });
blacklistSchema.index({ businessUnit: 1 });
blacklistSchema.index({ type: 1 });
blacklistSchema.index({ isActive: 1 });

// Apply Context-Aware Data Isolation
blacklistSchema.plugin(contextScopePlugin, {
    businessUnitField: 'businessUnit'
});

export const Blacklist = model<IBlacklist>("Blacklist", blacklistSchema);
