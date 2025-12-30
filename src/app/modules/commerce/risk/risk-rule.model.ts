import { Schema, model } from "mongoose";

export interface IRiskRule {
    name: string;
    condition: {
        field: string; // e.g., 'returnRate', 'orderValue'
        operator: "gt" | "lt" | "eq" | "gte" | "lte";
        value: number | string;
    };
    action: "block" | "flag" | "review";
    priority: number;
    businessUnit: Schema.Types.ObjectId;
    isActive: boolean;
}

const riskRuleSchema = new Schema<IRiskRule>({
    name: { type: String, required: true },
    condition: {
        field: { type: String, required: true },
        operator: {
            type: String,
            enum: ["gt", "lt", "eq", "gte", "lte"],
            required: true
        },
        value: { type: Schema.Types.Mixed, required: true }
    },
    action: {
        type: String,
        enum: ["block", "flag", "review"],
        required: true
    },
    priority: { type: Number, default: 1 },
    businessUnit: { type: Schema.Types.ObjectId, ref: "BusinessUnit", required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

riskRuleSchema.index({ businessUnit: 1 });
riskRuleSchema.index({ isActive: 1 });
riskRuleSchema.index({ priority: 1 });

export const RiskRule = model<IRiskRule>("RiskRule", riskRuleSchema);
